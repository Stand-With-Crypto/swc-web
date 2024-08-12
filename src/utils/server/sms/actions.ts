import 'server-only'

import { SMSStatus, User } from '@prisma/client'
import { waitUntil } from '@vercel/functions'

// TODO: Uncomment this after we start using Messaging Service
// import { GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/goodbyeSMSCommunicationJourney'
// import { UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/unstopConfirmationSMSCommunicationJourney'
import { WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/welcomeSMSCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { smsProvider, SMSProviders } from '@/utils/shared/smsProvider'

export async function optInUser(phoneNumber: string, user: User) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (
    user.smsStatus === SMSStatus.OPTED_OUT ||
    ([
      SMSStatus.OPTED_IN,
      SMSStatus.OPTED_IN_HAS_REPLIED,
      SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
    ].includes(user.smsStatus) &&
      user.phoneNumber === normalizedPhoneNumber) // If user has already opted in and has not changed their phone number, we don't want to send a message
  ) {
    return
  }

  // If user opted-out, the only way to opt-back is by sending us a UNSTOP keyword
  if ([SMSStatus.NOT_OPTED_IN, SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN].includes(user.smsStatus)) {
    await prismaClient.user.updateMany({
      data: {
        smsStatus: SMSStatus.OPTED_IN,
      },
      where: {
        phoneNumber: normalizedPhoneNumber,
      },
    })
  }

  if (smsProvider === SMSProviders.TWILIO) {
    await inngest.send({
      name: WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
      data: {
        phoneNumber: normalizedPhoneNumber,
      },
    })
  }

  waitUntil(
    getServerAnalytics({
      localUser: getLocalUserFromUser(user),
      userId: user.id,
    })
      .track('User SMS Opt-In', {
        provider: smsProvider,
      })
      .flush(),
  )
}

export async function optOutUser(phoneNumber: string, isSWCKeyword: boolean, user?: User) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (user?.smsStatus === SMSStatus.OPTED_OUT) return

  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_OUT,
    },
    where: {
      phoneNumber: normalizedPhoneNumber,
    },
  })

  // TODO: Uncomment this after we start using Messaging Service
  // We shouldn't send a message if the user replied with a default STOP keyword because Twilio will block it
  // if (isSWCKeyword && smsProvider === SMSProviders.TWILIO) {
  //   await inngest.send({
  //     name: GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  //     data: {
  //       phoneNumber: normalizedPhoneNumber,
  //     },
  //   })
  // }

  if (user) {
    waitUntil(
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .track('User SMS Opt-out', {
          type: isSWCKeyword ? 'SWC STOP Keyword' : 'STOP Keyword',
        })
        .flush(),
    )
  }
}

export async function optUserBackIn(phoneNumber: string, user?: User) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (user?.smsStatus !== SMSStatus.OPTED_OUT) return

  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_IN_HAS_REPLIED,
    },
    where: {
      phoneNumber: normalizedPhoneNumber,
    },
  })

  // TODO: Uncomment this after we start using Messaging Service
  // if (smsProvider === SMSProviders.TWILIO) {
  //   await inngest.send({
  //     name: UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  //     data: {
  //       phoneNumber: normalizedPhoneNumber,
  //     },
  //   })
  // }

  if (user) {
    waitUntil(
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .track('User SMS Unstop')
        .flush(),
    )
  }
}
