import { DataCreationMethod, UserInformationVisibility } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { mergeUsers } from '@/utils/server/mergeUsers/mergeUsers'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

export interface ScriptPayload {
  limit: number
  persist: boolean
  includeTotalCountCalculation: boolean
}

const logger = getLogger('mergeBackfilledUsers')

const MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID = 'script.merge-backfilled-users'
const MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME = 'script/merge.backfilled.users'

export const mergeBackfilledUsersWithInngest = inngest.createFunction(
  {
    id: MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = await step.run('script.initialize-payload', async () => {
      const params = event.data as ScriptPayload
      if (!params.limit || params.limit <= 0) {
        logger.info('`limit` not provided - defaulting to 100')
        params.limit = 100
      }
      return params
    })

    if (payload.includeTotalCountCalculation) {
      await step.run('script.calculate-total-all-duplicate-user-counts', async () => {
        logger.info('Calculating total duplicate user counts...')
        const groupings = await findDuplicateUserEmailAddressGroupings(0)
        logger.info(`Found total ${groupings.length} duplicate user email address groupings`)
      })
    }

    const userEmailAddressGroupings = await step.run(
      'script.find-duplicate-user-email-address-groupings',
      async () => {
        logger.info('Finding duplicate user email address groupings...')
        const groupings = await findDuplicateUserEmailAddressGroupings(payload.limit)
        logger.info(`Found ${groupings.length} duplicate user email address groupings`)
        return groupings
      },
    )

    let groupingIndex = 0
    for (const emailAddressGrouping of userEmailAddressGroupings) {
      await step.run(`script.merge-users-by-email-address-${groupingIndex}`, async () => {
        await mergeUsersByEmailAddress(emailAddressGrouping.emailAddress, payload.persist)
      })
      groupingIndex += 1
    }

    logger.info('Finished merging users')
  },
)

/**
 * This function finds duplicate user email address groupings.
 * Due to the grouping query, this function can take a long while to run (more than the default Vercel serverless function of 15 seconds).
 *
 * @param limit
 * @returns
 */
async function findDuplicateUserEmailAddressGroupings(limit: number) {
  return await prismaClient.userEmailAddress.groupBy({
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
    ...(limit && { take: limit }),
  })
}

/**
 * This function merges users by email address.
 *
 * @param emailAddress
 * @param persist
 * @returns
 */
async function mergeUsersByEmailAddress(emailAddress: string, persist: boolean) {
  const userEmailAddresses = await prismaClient.userEmailAddress.findMany({
    where: {
      emailAddress: emailAddress,
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
  // If the user has been already merged by the user before being caught by this portion of the script, then we can expect
  //   the length of `userEmailAddresses` to be 1.
  // As such, we should skip the user.
  if (userEmailAddresses.length <= 1) {
    return
  }
  logger.info(`Found next' ${userEmailAddresses.length} email address rows`)

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
    }
  }
}
