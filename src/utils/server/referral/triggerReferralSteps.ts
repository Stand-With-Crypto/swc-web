import * as Sentry from '@sentry/nextjs'
import { after } from 'next/server'

import { actionCreateUserActionReferral } from '@/actions/actionCreateUserActionReferral'
import { addToPendingReferralsQueue } from '@/utils/server/referral/pendingReferrals'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'

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
    try {
      const result = await actionCreateUserActionReferral({ referralId, userId, localUser })

      if (result.errors) {
        await addToPendingReferralsQueue({ referralId, userId })
        logger.info('Failed to process referral immediately, added to queue for retry', {
          referralId,
          userId,
          errors: result.errors,
        })
      } else {
        // sendReferralEmail() TODO
      }
    } catch (error) {
      await addToPendingReferralsQueue({ referralId, userId })
      logger.error('Failed to process referral immediately, added to queue for retry')
      Sentry.captureException(error, {
        extra: { referralId, userId, error },
        tags: { domain: 'referral' },
      })
    }
  })
}
