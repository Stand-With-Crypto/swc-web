import { DataCreationMethod, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { boolean, number, object, z } from 'zod'

import { mergeUsers } from '@/utils/server/mergeUsers/mergeUsers'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('mergeBackfilledUsers')

export const zodMergeBackfilledUsers = object({
  limit: number().optional(),
  persist: boolean().optional(),
  calculateMode: boolean().optional(),
})

export async function calculateAndLogDuplicateUserCounts() {
  await mergeBackfilledUsers({ calculateMode: true })
}

export async function mergeBackfilledUsers(parameters: z.infer<typeof zodMergeBackfilledUsers>) {
  zodMergeBackfilledUsers.parse(parameters)
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
   * - By my investigation, I determined that the email addresses can easily tell us if a user has attempted to log in or not.
   *   - If they have not logged in at all, then the email addresses are left unmerged.
   *   - If they have logged in with email, then the email addresses should have already been merged (and hence no duplicate users).
   *   - If they have logged in with a crypto address, then there might still be duplicate email addresses.
   *     - However, we should not touch those two distinguishable users because it is intentional that email users are different than crypto users.
   *       - There are only about a few hundred of these cases as far as I can tell. We should still consider them as separate users.
   *
   * "What about crypto addresses?"
   * - By my investigation, I determine that if there are any duplicate crypto addresses, then that usually means that there are 2+ users
   *   that use the same crypto address but use different email addresses.
   *   - A common case for this is for couples who share the same crypto address in SWC V1.
   *   - I believe that this is not a problem and that we should not merge these users.
   * - Also, if there is a case there are duplicate users that have the same email address and the same crypto address, the script
   *   below will still catch those duplicate users anyways based on email address and merge properly.
   * - If there is still a lot of duplicate users based on crypto addresses, we can handle in a follow-up PR.
   *
   * However, because there are matching emails that might actually be used by users who have already logged-in,
   *   we also want to only consider users that match these joint attributes:
   * - anonymous
   * - created from the initial backfill
   * - acquired through `capital-canary-initial-backfill`
   * - all actions are created from the initial backfill
   * - all crypto addresses are created from initial backfill
   */
  logger.info('Finding duplicate email addresses...', { parameters })
  const userEmailAddressGroupings = await prismaClient.userEmailAddress.groupBy({
    by: ['emailAddress'],
    where: {
      dataCreationMethod: {
        notIn: ['BY_USER'],
      },
      user: {
        informationVisibility: UserInformationVisibility.ANONYMOUS,
        dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
        acquisitionSource: 'capital-canary-initial-backfill',
        userActions: {
          every: {
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
        userCryptoAddresses: {
          every: {
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          },
        },
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
    ...(parameters.limit && { take: parameters.limit }),
  })
  if (userEmailAddressGroupings.length === 0) {
    logger.info('No duplicate email addresses found')
    return 0
  }
  logger.info(
    `${parameters.calculateMode ? 'Counted' : 'Found next'} ${userEmailAddressGroupings.length}${parameters.calculateMode ? ' total' : ''} duplicate email addresses`,
  )
  if (parameters.calculateMode) {
    return 0
  }

  let mergedUsersCount = 0
  const newUserIdsToSkip: string[] = []
  for (const emailAddress of userEmailAddressGroupings) {
    // For each email address, find all email address rows that match the email address.
    // We will use the rows to get the user ID.
    // Also filter out the specific attributes again here just to make sure.
    const userEmailAddresses = await prismaClient.userEmailAddress.findMany({
      where: {
        emailAddress: emailAddress.emailAddress,
        user: {
          informationVisibility: UserInformationVisibility.ANONYMOUS,
          dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
          acquisitionSource: 'capital-canary-initial-backfill',
          userActions: {
            every: {
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            },
          },
          userCryptoAddresses: {
            every: {
              dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            },
          },
        },
      },
      orderBy: {
        userId: 'asc',
      },
    })
    logger.info(`Found next' ${userEmailAddresses.length} email address rows`)

    // This may happen if the user has been already merged by the user before being caught by this portion of the script,
    // so we should skip this user if the length is less than or equal to 1.
    if (userEmailAddresses.length <= 1) {
      continue
    }

    // Choose a user to keep - the rest will be deleted.
    const userIdToKeep = userEmailAddresses[0].userId
    const userIdsToDelete = userEmailAddresses.slice(1).map(({ userId }) => userId)

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

      // Also double-check that we are not merging the same user.
      if (userToKeep.id === userToDelete.id) {
        continue
      }

      // Merge the users if persist is true.
      try {
        await mergeUsers({
          userToDeleteId: userIdToDelete,
          userToKeepId: userIdToKeep,
          persist,
        })
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            userIdToDelete,
            userIdToKeep,
          },
          tags: {
            domain: 'mergeUsers',
          },
        })
        newUserIdsToSkip.push(userIdToKeep)
        newUserIdsToSkip.push(userIdToDelete)
        continue
      }
      mergedUsersCount++
    }
  }

  return mergedUsersCount
}
