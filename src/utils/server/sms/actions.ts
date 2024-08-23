import 'server-only'

import { SMSStatus, User } from '@prisma/client'
import { waitUntil } from '@vercel/functions'

// TODO: Uncomment this after we start using Messaging Service
// import { GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/goodbyeSMSCommunicationJourney'
// import { UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/unstopConfirmationSMSCommunicationJourney'
import { WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/welcomeSMSCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
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

  const newSMSStatus =
    smsProvider === SMSProviders.TWILIO
      ? SMSStatus.OPTED_IN
      : SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN

  // If user opted-out, the only way to opt-back is by sending us a UNSTOP keyword
  if ([SMSStatus.NOT_OPTED_IN, SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN].includes(user.smsStatus)) {
    await prismaClient.user.updateMany({
      data: {
        smsStatus: newSMSStatus,
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
    Promise.all([
      getServerPeopleAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .set({
          'Has Opted In to SMS': true,
          'SMS Status': newSMSStatus,
        })
        .flush(),
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .track('User SMS Opt-In', {
          provider: smsProvider,
        })
        .flush(),
    ]),
  )
}

export async function optOutUser(phoneNumber: string, user: User) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (user.smsStatus === SMSStatus.OPTED_OUT) return user.smsStatus

  const newSMSStatus = SMSStatus.OPTED_OUT

  await prismaClient.user.updateMany({
    data: {
      smsStatus: newSMSStatus,
    },
    where: {
      phoneNumber: normalizedPhoneNumber,
    },
  })

  // TODO: Uncomment this after we start using Messaging Service
  // We shouldn't send a message if the user replied with a default STOP keyword because Twilio will block it
  // if (smsProvider === SMSProviders.TWILIO) {
  //   await inngest.send({
  //     name: GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  //     data: {
  //       phoneNumber: normalizedPhoneNumber,
  //     },
  //   })
  // }

  waitUntil(
    Promise.all([
      getServerPeopleAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .set({
          'Has Opted In to SMS': false,
          'SMS Status': newSMSStatus,
        })
        .flush(),
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .track('User SMS Opt-out')
        .flush(),
    ]),
  )

  return newSMSStatus
}

export async function optUserBackIn(phoneNumber: string, user: User) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (user.smsStatus !== SMSStatus.OPTED_OUT) return user.smsStatus

  const newSMSStatus = SMSStatus.OPTED_IN_HAS_REPLIED

  await prismaClient.user.updateMany({
    data: {
      smsStatus: newSMSStatus,
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

  waitUntil(
    Promise.all([
      getServerPeopleAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .set({
          'Has Opted In to SMS': true,
          'SMS Status': newSMSStatus,
        })
        .flush(),
      getServerAnalytics({
        localUser: getLocalUserFromUser(user),
        userId: user.id,
      })
        .track('User SMS Unstop')
        .flush(),
    ]),
  )
}
