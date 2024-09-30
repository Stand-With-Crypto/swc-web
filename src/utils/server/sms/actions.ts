import 'server-only'

import { SMSStatus, User, UserCommunicationJourneyType } from '@prisma/client'
import { waitUntil } from '@vercel/functions'

import { ENQUEUE_SMS_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/enqueueMessages'
// TODO: Uncomment this after we start using Messaging Service
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import * as messages from '@/utils/server/sms/messages'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { smsProvider, SMSProviders } from '@/utils/shared/smsProvider'

export async function optInUser(phoneNumber: string, user: User): Promise<SMSStatus> {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (
    user.smsStatus === SMSStatus.OPTED_OUT ||
    ([SMSStatus.OPTED_IN, SMSStatus.OPTED_IN_HAS_REPLIED].includes(user.smsStatus) &&
      user.phoneNumber === normalizedPhoneNumber) // If user has already opted in and has not changed their phone number, we don't want to send a message
  ) {
    return user.smsStatus
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
      name: ENQUEUE_SMS_INNGEST_EVENT_NAME,
      data: {
        payload: [
          {
            phoneNumber,
            messages: [
              {
                journeyType: UserCommunicationJourneyType.WELCOME_SMS,
                body: messages.WELCOME_MESSAGE,
              },
            ],
          },
        ],
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

  return newSMSStatus
}

export async function optOutUser(phoneNumber: string, user?: User | null) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (user?.smsStatus === SMSStatus.OPTED_OUT) return user.smsStatus

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
  //     name: ENQUEUE_SMS_INNGEST_EVENT_NAME,
  //     data: {
  //       payload: [
  //         {
  //           phoneNumber,
  //           messages: [
  //             {
  //               journeyType: UserCommunicationJourneyType.GOODBYE_SMS,
  //               body: messages.GOODBYE_MESSAGE,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   })
  // }

  if (user) {
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
  }

  return newSMSStatus
}

export async function optUserBackIn(phoneNumber: string, user?: User | null) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (user?.smsStatus !== SMSStatus.OPTED_OUT) return user?.smsStatus

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
  //     name: ENQUEUE_SMS_INNGEST_EVENT_NAME,
  //     data: {
  //       payload: [
  //         {
  //           phoneNumber,
  //           messages: [
  //             {
  //               journeyType: UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
  //               body: messages.UNSTOP_CONFIRMATION_MESSAGE,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   })
  // }

  if (user) {
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
}
