import * as React from 'react'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'

import { sendMail, SendMailPayload } from '@/utils/server/email'
import { EmailActiveActions } from '@/utils/server/email/templates/common/constants'
import ReferralCompletedEmail from '@/utils/server/email/templates/referralCompleted'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { externalUrls } from '@/utils/shared/urls'

const logger = getLogger('sendReferralCompletedEmail')

export async function sendReferralCompletedEmail(referralId: string) {
  const referrer = await prismaClient.user.findFirstOrThrow({
    where: { referralId },
    include: {
      primaryUserEmailAddress: true,
      userActions: true,
      userSessions: true,
    },
  })

  if (!referrer?.primaryUserEmailAddress?.emailAddress) {
    logger.info(`No email found for referrer with referralId: ${referralId}`)
    return null
  }

  const referralLink = externalUrls.swcReferralUrl({ referralId })

  const userSession = referrer.userSessions?.[0]
  const emailPayload: SendMailPayload = {
    to: referrer.primaryUserEmailAddress.emailAddress,
    subject: ReferralCompletedEmail.subjectLine,
    html: await render(
      <ReferralCompletedEmail
        completedActionTypes={referrer.userActions
          .filter(action => Object.values(EmailActiveActions).includes(action.actionType))
          .map(action => action.actionType as EmailActiveActions)}
        name={referrer.firstName}
        referralLink={referralLink}
        session={
          userSession
            ? {
                userId: userSession.userId,
                sessionId: userSession.id,
              }
            : null
        }
      />,
    ),
    customArgs: {
      userId: referrer.id,
      campaign: ReferralCompletedEmail.campaign,
      name: referrer.firstName,
      referralLink,
    },
  }

  try {
    await sendMail(emailPayload)
    logger.info(`Sent referral completed email to ${referrer.primaryUserEmailAddress.emailAddress}`)
  } catch (err) {
    Sentry.captureException(err, {
      extra: {
        referralId,
        userId: referrer.id,
        emailTo: referrer.primaryUserEmailAddress.emailAddress,
      },
      tags: { domain: 'referral' },
    })
    throw err
  }
}
