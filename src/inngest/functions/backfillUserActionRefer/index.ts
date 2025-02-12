import { UserActionType } from '@prisma/client'
import { groupBy } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'

const BACKFILL_USER_ACTION_REFER_INNGEST_EVENT_NAME = 'script/backfill-user-action-refer'
const BACKFILL_USER_ACTION_REFER_INNGEST_FUNCTION_ID = 'script.backfill-user-action-refer'

export interface BackfillUserActionReferInngestSchema {
  name: typeof BACKFILL_USER_ACTION_REFER_INNGEST_EVENT_NAME
  data: {
    persist: boolean
  }
}

export const backfillUserActionRefer = inngest.createFunction(
  {
    id: BACKFILL_USER_ACTION_REFER_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_USER_ACTION_REFER_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { persist = false } = event.data

    logger.info(`Started with persist=${String(persist)}`)

    // Find all users who were referred (have utm_source=swc and utm_medium=referral)
    const referredUsers = await step.run('find-referred-users', async () => {
      const users = await prismaClient.user.findMany({
        where: {
          acquisitionSource: 'swc',
          acquisitionMedium: 'referral',
          // Make sure they have a referral ID in the campaign
          NOT: {
            acquisitionCampaign: '',
          },
        },
        select: {
          id: true,
          acquisitionCampaign: true, // This contains the referrer's referral ID
        },
      })
      logger.info(`Found ${users.length} referred users`)
      return users
    })

    // Group referred users by their referrer's ID
    const referredUsersGroupedByReferrerId = groupBy(referredUsers, 'acquisitionCampaign')

    // Find all referrers by their referral IDs
    const referrerIds = Object.keys(referredUsersGroupedByReferrerId)
    const referrers = await step.run('find-referrers', async () => {
      const users = await prismaClient.user.findMany({
        where: {
          referralId: {
            in: referrerIds,
          },
        },
        include: {
          userActions: true,
        },
      })
      logger.info(`Found ${users.length} referrers`)
      return users
    })

    // Create or update REFER actions
    const updates = referrers.map(referrer => ({
      referrer,
      referredCount: referredUsersGroupedByReferrerId[referrer.referralId].length,
      existingReferAction: referrer.userActions.find(
        action => action.actionType === UserActionType.REFER,
      ),
    }))

    if (!persist) {
      logger.info(`[DRY RUN] Would process ${updates.length} referrer actions`)
      return { message: 'Dry run complete', count: updates.length }
    }

    const results = await step.run('process-updates', async () => {
      const processed = await batchAsyncAndLog(updates, async batch =>
        Promise.all(
          batch.map(({ referrer, referredCount, existingReferAction }) => {
            if (existingReferAction) {
              logger.info(
                `Updating existing REFER action for user ${referrer.id} with ${referredCount} referrals`,
              )
              return prismaClient.userAction.update({
                where: { id: existingReferAction.id },
                data: {
                  userActionRefer: {
                    update: {
                      referralsCount: referredCount,
                    },
                  },
                },
              })
            } else {
              logger.info(
                `Creating new REFER action for user ${referrer.id} with ${referredCount} referrals`,
              )
              return prismaClient.userAction.create({
                data: {
                  userId: referrer.id,
                  actionType: UserActionType.REFER,
                  campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
                  userActionRefer: {
                    create: {
                      referralsCount: referredCount,
                    },
                  },
                },
              })
            }
          }),
        ),
      )
      const totalProcessed = processed.reduce((acc, batch) => acc + batch.length, 0)
      logger.info(`Successfully processed ${totalProcessed} referral actions`)
      return totalProcessed
    })

    return { processedCount: results, updatesFound: updates.length }
  },
)
