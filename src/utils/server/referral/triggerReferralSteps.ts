import { Address, User } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { after } from 'next/server'

import { actionCreateUserActionReferral } from '@/actions/actionCreateUserActionReferral'
import { PROCESS_REFERRAL_INNGEST_EVENT_NAME } from '@/inngest/functions/referrals/processReferral'
import { inngest } from '@/inngest/inngest'
import { REDIS_KEYS } from '@/utils/server/districtRankings/constants'
import { createDistrictRankingIncrementer } from '@/utils/server/districtRankings/upsertRankings'
import { prismaClient } from '@/utils/server/prismaClient'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'
import { USStateCode } from '@/utils/shared/usStateUtils'

import { sendReferralCompletedEmail } from './sendReferralCompletedEmail'

const logger = getLogger('triggerReferralSteps')

type UpsertedUser = User & {
  address: Address | null
}

export function triggerReferralSteps({
  localUser,
  searchParams,
  newUser,
}: {
  localUser: ServerLocalUser | null
  searchParams: Record<string, string | undefined>
  newUser: UpsertedUser
}) {
  const referralId =
    searchParams?.utm_campaign ??
    localUser?.persisted?.initialSearchParams?.utm_campaign ??
    localUser?.currentSession?.searchParamsOnLoad?.utm_campaign ??
    ''

  logger.info(`referralId "${referralId}", newUserId "${newUser.id}"`)

  if (!referralId) {
    logger.error('invalid logic, referral has no referralId')
    Sentry.captureMessage(
      'invalid logic, we should only hit this point if the referralId is present',
      {
        tags: {
          domain: 'referral',
        },
        extra: { referralId, searchParams, localUser, userId: newUser.id },
      },
    )
    return
  }

  after(async () => {
    let result: Awaited<ReturnType<typeof actionCreateUserActionReferral>>
    try {
      result = await actionCreateUserActionReferral({
        referralId,
        newUserId: newUser.id,
        localUser,
      })
    } catch (error) {
      logger.error('Failed to process referral immediately, added to queue for retry')
      await inngest.send({
        name: PROCESS_REFERRAL_INNGEST_EVENT_NAME,
        data: {
          referralId,
          newUserId: newUser.id,
          localUser,
        },
      })
      Sentry.captureException(error, {
        tags: { domain: 'referral' },
        extra: { referralId, newUserId: newUser.id, localUser },
      })
      throw error
    }

    if (result.errors) {
      await inngest.send({
        name: PROCESS_REFERRAL_INNGEST_EVENT_NAME,
        data: {
          referralId,
          newUserId: newUser.id,
          localUser,
        },
      })
      logger.error('Failed to process referral immediately, added to queue for retry')
      Sentry.captureException('Failed to process referral immediately', {
        tags: { domain: 'referral' },
        extra: { referralId, newUserId: newUser.id, localUser },
      })
      return
    }

    if (result.wasActionCreated) {
      await sendReferralCompletedEmail(referralId)
    }

    after(async () => {
      if (result.errors || !result) return

      const [incrementDistrictAdvocatesRanking, incrementDistrictReferralsRanking] =
        await Promise.all([
          createDistrictRankingIncrementer(REDIS_KEYS.DISTRICT_ADVOCATES_RANKING),
          createDistrictRankingIncrementer(REDIS_KEYS.DISTRICT_REFERRALS_RANKING),
        ])

      if (newUser.address) {
        await incrementDistrictAdvocatesRanking({
          state: newUser.address.administrativeAreaLevel1 as USStateCode,
          district: newUser.address.usCongressionalDistrict || '1',
          count: 1,
        })
      }

      const referrer = await prismaClient.user.findFirst({
        where: { referralId },
        include: {
          address: true,
        },
      })

      if (referrer?.address) {
        await incrementDistrictReferralsRanking({
          state: referrer.address.administrativeAreaLevel1 as USStateCode,
          district: referrer.address.usCongressionalDistrict || '1',
          count: 1,
        })
      }
    })
  })
}
