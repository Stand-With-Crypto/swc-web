import * as Sentry from '@sentry/nextjs'
import { after } from 'next/server'

import { actionCreateUserActionReferral } from '@/actions/actionCreateUserActionReferral'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'

import { sendReferralCompletedEmail } from './sendReferralCompletedEmail'

const logger = getLogger('triggerReferralSteps')

export function triggerReferralSteps({
  localUser,
  searchParams,
  userId,
}: {
  localUser: ServerLocalUser | null
  searchParams: Record<string, string | undefined>
  userId: string
}) {
  const referralId =
    searchParams?.utm_campaign ??
    localUser?.persisted?.initialSearchParams?.utm_campaign ??
    localUser?.currentSession?.searchParamsOnLoad?.utm_campaign ??
    ''

  logger.info(`referralId "${referralId}", newUserId "${userId}"`)

  if (!referralId) {
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

  after(async () => {
    const result = await actionCreateUserActionReferral({ referralId, userId, localUser })

    if (result.wasActionCreated) {
      await sendReferralCompletedEmail(referralId)
    }
  })
}
