import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'
import { z } from 'zod'

import { actionCreateUserActionReferral } from '@/actions/actionCreateUserActionReferral'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { REDIS_KEYS } from '@/utils/server/districtRankings/constants'
import { createDistrictRankingIncrementer } from '@/utils/server/districtRankings/upsertRankings'
import { prismaClient } from '@/utils/server/prismaClient'
import { sendReferralCompletedEmail } from '@/utils/server/referral/sendReferralCompletedEmail'
import { zodServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { zodReferralId } from '@/validation/fields/zodReferrald'

const logger = getLogger('processReferral')

export const PROCESS_REFERRAL_INNGEST_FUNCTION_ID = 'script.process-referral'
export const PROCESS_REFERRAL_INNGEST_EVENT_NAME = 'script/process-referral'
const MAX_RETRY_ATTEMPTS = 5

const zodProcessReferralSchema = z.object({
  referralId: zodReferralId,
  newUserId: z.string().uuid(),
  localUser: zodServerLocalUser.nullable(),
  attempt: z.number().optional(),
})

export interface ProcessReferralSchema {
  name: typeof PROCESS_REFERRAL_INNGEST_EVENT_NAME
  data: z.infer<typeof zodProcessReferralSchema>
}

export const processReferral = inngest.createFunction(
  {
    id: PROCESS_REFERRAL_INNGEST_FUNCTION_ID,
    concurrency: {
      limit: 5,
      key: 'event.data.referralId + "-" + event.data.userId',
    },
    onFailure: onScriptFailure,
  },
  { event: PROCESS_REFERRAL_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const {
      referralId,
      newUserId,
      localUser,
      attempt = 0,
    } = zodProcessReferralSchema.parse(event.data)

    logger.info('Processing referral:', { referralId, attempt })

    if (attempt >= MAX_RETRY_ATTEMPTS) {
      logger.error('Max retry attempts reached for processing referral', { referralId, newUserId })
      Sentry.captureException('Max retry attempts reached for processing referral', {
        extra: { referralId, newUserId },
        tags: { domain: 'referral' },
      })
      throw new NonRetriableError('Max retry attempts reached for processing referral')
    }

    const result = await step.run('process-referral', async () => {
      return await actionCreateUserActionReferral({
        referralId,
        newUserId,
        localUser,
      })
    })

    if ('errors' in result && result.errors) {
      const waitingTime = 1000 * (attempt * attempt)
      logger.warn(`Failed to process referral ${referralId}, retrying in ${waitingTime}ms`)

      await step.sleep('wait-before-retry', waitingTime)

      await step.invoke('retry-process-referral', {
        function: processReferral,
        data: {
          referralId,
          newUserId,
          localUser,
          attempt: attempt + 1,
        },
      })

      return { success: false, result }
    }

    logger.info('Successfully processed referral', { referralId })

    if (result && 'wasActionCreated' in result && result.wasActionCreated) {
      await step.run(
        'send-referral-email',
        async () => await sendReferralCompletedEmail(referralId),
      )
    }

    await step.run('increment-district-advocates-rankings', async () => {
      const incrementDistrictAdvocatesRanking = await createDistrictRankingIncrementer(
        REDIS_KEYS.DISTRICT_ADVOCATES_RANKING,
      )

      const newUser = await prismaClient.user.findFirstOrThrow({
        where: { id: newUserId },
        include: {
          address: true,
        },
      })

      if (newUser.address) {
        return await incrementDistrictAdvocatesRanking({
          state: newUser.address.administrativeAreaLevel1 as USStateCode,
          district: newUser.address.usCongressionalDistrict || '1',
          count: 1,
        })
      }
    })

    await step.run('increment-district-referrals-rankings', async () => {
      const incrementDistrictReferralsRanking = await createDistrictRankingIncrementer(
        REDIS_KEYS.DISTRICT_REFERRALS_RANKING,
      )

      const referrer = await prismaClient.user.findFirst({
        where: { referralId },
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

      if (referrer?.address) {
        return await incrementDistrictReferralsRanking({
          state: referrer.address.administrativeAreaLevel1 as USStateCode,
          district: referrer.address.usCongressionalDistrict || '1',
          count: 1,
        })
      }
    })

    return {
      success: true,
      referralId,
      result,
    }
  },
)
