import * as Sentry from '@sentry/nextjs'
import { after } from 'next/server'

import { actionCreateUserActionReferral } from '@/actions/actionCreateUserActionReferral'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'

type ReferralUTMParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

const logger = getLogger('triggerReferralSteps')

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
  userId,
}: {
  localUser: ServerLocalUser | null
  searchParams: Record<string, string | undefined>
  userId: string
}) {
  const isReferral =
    isValidReferral(searchParams) || isValidReferral(localUser?.persisted?.initialSearchParams)

  const referralId = searchParams?.utm_campaign ?? ''

  logger.info(`referralId "${referralId}", newUserId "${userId}"`)

  if (isReferral && !referralId) {
    logger.error('invalid logic, referral has no referralId')
    Sentry.captureMessage(
      'invalid logic, we should only hit this point if the referralId is present',
      {
        tags: {
          domain: 'referral',
        },
        extra: { referralId, searchParams, localUser, userId },
      },
    )
    return
  }

  if (isReferral) {
    after(async () => {
      await actionCreateUserActionReferral({ referralId, userId, localUser })
      // sendReferralEmail() TODO
    })
  }
}
