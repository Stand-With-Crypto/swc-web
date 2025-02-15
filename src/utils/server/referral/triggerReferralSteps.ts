import * as Sentry from '@sentry/nextjs'
import { after } from 'next/server'

import { createReferral } from '@/utils/server/referral/createReferral'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'
import { logger } from '@/utils/shared/logger'

type ReferralUTMParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

function isValidReferral(params: ReferralUTMParams | undefined): boolean {
  if (!params) return false

  return (
    params?.utm_source === 'swc' &&
    params?.utm_medium === 'referral' &&
    typeof params?.utm_campaign === 'string' &&
    params?.utm_campaign?.length > 0
  )
}

export function triggerReferralSteps({
  localUser,
  searchParams,
}: {
  localUser: ServerLocalUser | null
  searchParams: Record<string, string | undefined>
}) {
  const isReferral =
    isValidReferral(searchParams) || isValidReferral(localUser?.persisted?.initialSearchParams)

  const referralId = searchParams?.utm_campaign ?? ''

  logger.info(`triggerReferralSteps: referralId "${referralId}"`)

  if (isReferral && !referralId) {
    logger.error('triggerReferralSteps: invalid logic, referral has no referralId')
    Sentry.captureMessage(
      'triggerReferralSteps: invalid logic, we should only hit this point if the referralId is present',
      {
        tags: {
          domain: 'referral',
        },
        extra: { referralId, searchParams, localUser },
      },
    )
    return
  }

  if (isReferral) {
    after(async () => {
      await createReferral({ referralId })
      // sendReferralEmail() TODO
    })
  }
}
