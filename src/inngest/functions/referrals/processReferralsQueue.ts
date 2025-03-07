import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { findOrCreateUserActionRefer } from '@/actions/actionCreateUserActionReferral'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { redis } from '@/utils/server/redis'
import {
  getPendingReferrals,
  isValidPendingReferralEntry,
} from '@/utils/server/referral/pendingReferrals'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger('processPendingReferralsQueue')

const PENDING_REFERRALS_QUEUE = 'pending-referrals'
const BATCH_SIZE = 100
const MAX_RETRIES = 3

const PROCESS_REFERRALS_QUEUE_SCHEDULE = '0 0 * * *' // Every day at midnight
const PROCESS_REFERRALS_QUEUE_INNGEST_FUNCTION_ID =
  'script.process-pending-referrals-queue-cron-job'
const PROCESS_REFERRALS_QUEUE_INNGEST_EVENT_NAME = 'script/process-pending-referrals-queue.cron.job'

export interface ProcessPendingReferralsCronJobSchema {
  name: typeof PROCESS_REFERRALS_QUEUE_INNGEST_EVENT_NAME
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
      include: {
        address: true,
        userActions: {
          where: {
            actionType: UserActionType.REFER,
          },
          include: {
            userActionRefer: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    })

    if (!referrer) {
      logger.error('Referrer not found', rawReferral)
      return { success: false, referralId: rawReferral.referralId }
    }

    const analytics = getServerAnalytics({
      userId: referrer.id,
      localUser: null,
    })
    const beforeFinish = () => Promise.all([analytics.flush()])
    await findOrCreateUserActionRefer({
      referrer,
      analytics,
      countryCode: referrer.countryCode,
    })
    await beforeFinish()

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
    const referralBatch = await step.run('Get pending referrals', () =>
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

    const processed = await step.run('Process pending referrals', () =>
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
