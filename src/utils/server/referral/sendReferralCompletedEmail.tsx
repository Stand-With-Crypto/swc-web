// import * as React from 'react'
// import { render } from '@react-email/components'
// import * as Sentry from '@sentry/nextjs'

// import { sendMail, SendMailPayload } from '@/utils/server/email'
// import {
//   EmailActiveActions,
//   getEmailActiveActionsByCountry,
// } from '@/utils/server/email/templates/common/constants'
// import { getReferralCompletedEmail } from '@/utils/server/email/templates/referralCompleted'
// import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
// import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const logger = getLogger('sendReferralCompletedEmail')

export async function sendReferralCompletedEmail(referralId: string) {
  logger.info('Skipping referral completed email sends')
  return null

  // const referrer = await prismaClient.user.findFirstOrThrow({
  //   where: { referralId },
  //   include: {
  //     primaryUserEmailAddress: true,
  //     userActions: true,
  //     userSessions: true,
  //   },
  // })

  // if (!referrer?.primaryUserEmailAddress?.emailAddress) {
  //   logger.info(`No email found for referrer with referralId: ${referralId}`)
  //   return null
  // }

  // const countryCode = referrer.countryCode as SupportedCountryCodes
  // const userSession = referrer.userSessions?.[0]
  // const ReferralCompletedEmail = getReferralCompletedEmail(countryCode)
  // const emailPayload: SendMailPayload = {
  //   to: referrer.primaryUserEmailAddress.emailAddress,
  //   subject: ReferralCompletedEmail.subjectLine,
  //   html: await render(
  //     <ReferralCompletedEmail
  //       completedActionTypes={referrer.userActions
  //         .filter(action =>
  //           Object.values(getEmailActiveActionsByCountry(countryCode)).includes(action.actionType),
  //         )
  //         .map(action => action.actionType as EmailActiveActions)}
  //       countryCode={countryCode}
  //       name={referrer.firstName}
  //       session={
  //         userSession
  //           ? {
  //               userId: userSession.userId,
  //               sessionId: userSession.id,
  //             }
  //           : null
  //       }
  //     />,
  //   ),
  //   customArgs: {
  //     userId: referrer.id,
  //     campaign: ReferralCompletedEmail.campaign,
  //   },
  // }

  // try {
  //   await sendMail({
  //     countryCode,
  //     payload: emailPayload,
  //   })
  //   logger.info(`Sent referral completed email to ${referrer.primaryUserEmailAddress.emailAddress}`)
  // } catch (err) {
  //   Sentry.captureException(err, {
  //     extra: {
  //       referralId,
  //       userId: referrer.id,
  //       emailTo: referrer.primaryUserEmailAddress.emailAddress,
  //     },
  //     tags: { domain: 'referral' },
  //   })
  //   throw err
  // }
}
