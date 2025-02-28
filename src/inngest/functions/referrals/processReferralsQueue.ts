import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { redis } from '@/utils/server/redis'
import {
  getPendingReferrals,
  isValidPendingReferralEntry,
} from '@/utils/server/referral/pendingReferrals'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns'

const logger = getLogger('processPendingReferralsQueue')

const PENDING_REFERRALS_QUEUE = 'pending-referrals'
const BATCH_SIZE = 100
const MAX_RETRIES = 3

const PROCESS_REFERRALS_QUEUE_SCHEDULE = '0 0 * * *' // Every day at midnight
const PROCESS_REFERRALS_QUEUE_INNGEST_FUNCTION_ID = 'script.process-referrals-queue-cron-job'
const PROCESS_REFERRALS_QUEUE_INNGEST_EVENT_NAME = 'script/process-referrals-queue.cron.job'

export interface ProcessPendingReferralsCronJobSchema {
  name: typeof PROCESS_REFERRALS_QUEUE_INNGEST_EVENT_NAME
}

async function getActualReferralCount(referralId: string): Promise<number> {
  return prismaClient.user.count({
    where: {
      acquisitionCampaign: referralId,
    },
  })
}

async function updateReferralCount(
  referrerId: string,
  actionId: string,
  currentCount: number,
  actualCount: number,
) {
  if (actualCount <= currentCount) {
    logger.warn(
      `Stored referral count (${currentCount}) is higher than actual count (${actualCount}) for referrer ${referrerId}`,
    )
    Sentry.captureMessage('Stored referral count is higher than actual count', {
      extra: {
        referrerId,
        storedCount: currentCount,
        actualCount,
      },
      tags: { domain: 'referrals' },
    })
    return
  }

  await prismaClient.userActionRefer.update({
    where: { id: actionId },
    data: {
      referralsCount: actualCount,
    },
  })
  logger.info(
    `Updated referral count for referrer ${referrerId} from ${currentCount} to ${actualCount}`,
  )
}

async function createReferralAction(
  referrerId: string,
  referralsCount: number,
  countryCode: string,
) {
  await prismaClient.userAction.create({
    data: {
      userId: referrerId,
      actionType: UserActionType.REFER,
      campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[UserActionType.REFER],
      countryCode,
      userActionRefer: {
        create: {
          referralsCount,
        },
      },
    },
  })
  logger.info(
    `Created REFER action for referrer ${referrerId} with initial count ${referralsCount}`,
  )
}

async function processPendingReferral(rawReferral: unknown) {
  if (!isValidPendingReferralEntry(rawReferral)) {
    logger.error('Invalid referral data structure', { rawReferral })
    return { success: false, referralId: 'unknown' }
  }

  if (rawReferral.retriesCount >= MAX_RETRIES) {
    logger.error('Max retries reached for referral', { rawReferral })
    Sentry.captureException(new Error('Max retries reached for referral'), {
      extra: { rawReferral },
      tags: { domain: 'referrals' },
    })
    return { success: false, referralId: rawReferral.referralId }
  }

  try {
    const referrer = await prismaClient.user.findFirst({
      where: { referralId: rawReferral.referralId },
      select: {
        id: true,
        countryCode: true,
        userActions: {
          select: {
            id: true,
            actionType: true,
            campaignName: true,
            userActionRefer: true,
          },
        },
      },
    })

    if (!referrer) {
      logger.error('Referrer not found', rawReferral)
      return { success: false, referralId: rawReferral.referralId }
    }

    const actualReferralCount = await getActualReferralCount(rawReferral.referralId)
    const existingReferAction = referrer.userActions.find(
      action => action.actionType === UserActionType.REFER,
    )

    if (existingReferAction?.userActionRefer) {
      await updateReferralCount(
        referrer.id,
        existingReferAction.id,
        existingReferAction.userActionRefer.referralsCount,
        actualReferralCount,
      )
    } else {
      await createReferralAction(referrer.id, actualReferralCount, referrer.countryCode)
    }

    return { success: true, referralId: rawReferral.referralId }
  } catch (error) {
    logger.error('Failed to process referral', { rawReferral, error })
    await redis.lpush(PENDING_REFERRALS_QUEUE, {
      ...rawReferral,
      retriesCount: rawReferral.retriesCount + 1,
    })
    return { success: false, referralId: rawReferral.referralId }
  }
}

export const processPendingReferralsQueue = inngest.createFunction(
  {
    id: PROCESS_REFERRALS_QUEUE_INNGEST_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: PROCESS_REFERRALS_QUEUE_SCHEDULE }
      : { event: PROCESS_REFERRALS_QUEUE_INNGEST_EVENT_NAME }),
  },
  async ({ step }) => {
    const referralBatch = await step.run('Get referrals batch', () =>
      getPendingReferrals(BATCH_SIZE),
    )

    if (!referralBatch?.length) {
      logger.info('No pending referrals to process')
      return {
        message: 'No pending referrals to process',
        processedCount: 0,
        successCount: 0,
        failureCount: 0,
      }
    }

    logger.info(`Processing ${referralBatch.length} referrals`)

    const processed = await step.run('Process referrals batch', () =>
      Promise.all(referralBatch.map(rawReferral => processPendingReferral(rawReferral))),
    )

    return {
      batchSize: referralBatch.length,
      processedCount: processed.length,
      successCount: processed.filter(r => r.success).length,
      failureCount: processed.filter(r => !r.success).length,
    }
  },
)
