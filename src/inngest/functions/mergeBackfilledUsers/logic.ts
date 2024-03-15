import { boolean, number, object, z } from 'zod'

import { mergeUsers } from '@/utils/server/mergeUsers/mergeUsers'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('mergeBackfilledUsers')

export const zodMergeBackfilledUsers = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

export async function mergeBackfilledUsers(parameters: z.infer<typeof zodMergeBackfilledUsers>) {
  zodMergeBackfilledUsers.parse(parameters)
  const limit = parameters.limit
  let persist = parameters.persist
  if (!persist) {
    persist = false
  }

  /**
   * Find all duplicate email groups where none of the emails were inputted by a user.
   * This implies that the emails were all from the V1 --> V2 backfill and that there has been no log-in attempt from that user.
   * (The data creation would be `BY_USER` if the user had inputted the email in V2. In those cases, we ignore those duplicate emails).
   *
   * Simply put, we want to find users where they share the same email address, and the email address is not an V2 input.
   *
   * "Why are you using the email addresses to determine duplicate users instead of user rows themselves?"
   * - There is no good way to determine duplicate users from the backfill from the users table:
   *   - Email addresses can be the same, but have different IDs - the users table will show the different IDs for different users, so that does not help.
   *   - Somehow, because of Capitol Canary's inconsistencies, the same user can have different Capitol Canary IDs, making that field unreliable.
   * - By my investigation, the email addresses can easily tell us if a user has attempted to log in or not.
   *   - If they have not logged in at all, then the email addresses are left unmerged.
   *   - If they have logged in with email, then the email addresses should have already been merged (and hence no duplicate users).
   *   - If they have logged in with a crypto address, then there might still be duplicate email addresses.
   *     - However, we should not touch those users because it is intentional that email users are different than crypto users.
   *       - There are only about a few hundred of these cases as far as I can tell. We should still consider them as separate users.
   *
   * "What about crypto addresses?"
   * - By my investigation, I determine that if there are any duplicate crypto addresses, then that usually means that there are 2+ users
   *   that use the same crypto address but use different email addresses.
   *   - A common case for this is for couples who share the same crypto address in SWC V1.
   *   - I believe that this is not a problem and that we should not merge these users.
   * - Also, if there is a case there are duplicate users that have the same email address and the same crypto address, the script
   *   below will still catch those duplicate users anyways based on email address and merge properly.
   */
  const userEmailAddressGroupings = await prismaClient.userEmailAddress.groupBy({
    by: ['emailAddress'],
    where: {
      dataCreationMethod: {
        notIn: ['BY_USER'],
      },
    },
    having: {
      emailAddress: {
        _count: {
          gt: 1,
        },
      },
    },
    orderBy: {
      emailAddress: 'asc',
    },
    take: limit,
  })
  logger.info(`Found ${userEmailAddressGroupings.length} duplicate email addresses`)

  // Get the full rows for the email addresses and for the users.
  const userEmailAddresses = await prismaClient.userEmailAddress.findMany({
    where: {
      emailAddress: {
        in: userEmailAddressGroupings.map(({ emailAddress }) => emailAddress),
      },
    },
  })
  logger.info(`Found ${userEmailAddresses.length} email address rows`)

  let mergedUsersCount = 0
  // Iterate through the email address groupings and merge the users.
  for (const emailAddress of userEmailAddressGroupings) {
    // Get all users for this email address.
    const usersForEmailAddress = userEmailAddresses.filter(
      emailAddressRow => emailAddressRow.emailAddress === emailAddress.emailAddress,
    )
    // This should not happen, but let's be safe.
    if (usersForEmailAddress.length <= 1) {
      continue
    }

    // Choose a user to keep - the rest will be deleted.
    const userIdToKeep = usersForEmailAddress[0].userId
    const userIdsToDelete = usersForEmailAddress.slice(1).map(({ userId }) => userId)

    for (const userIdToDelete of userIdsToDelete) {
      // Double-check that we have not already merged these users.
      const userToKeep = await prismaClient.user.findUnique({
        where: {
          id: userIdToKeep,
        },
      })
      const userToDelete = await prismaClient.user.findUnique({
        where: {
          id: userIdToDelete,
        },
      })
      if (!userToKeep || !userToDelete) {
        continue
      }

      // Merge the users if persist is true.
      await mergeUsers({
        userToDeleteId: userIdToDelete,
        userToKeepId: userIdToKeep,
        persist,
      })
      mergedUsersCount++
    }
  }

  logger.info(`Merged ${mergedUsersCount} users`)
}
