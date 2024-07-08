import 'server-only'

import { SMSStatus, User } from '@prisma/client'

import { GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/goodbyeSMSCommunicationJourney'
import { UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/unstopConfirmationSMSCommunicationJourney'
import { WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME } from '@/inngest/functions/sms/welcomeSMSCommunicationJourney'
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'

export async function optInUser(phoneNumber: string, user: User) {
  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_IN,
    },
    where: {
      phoneNumber,
    },
  })

  await inngest.send({
    name: WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
    data: {
      phoneNumber,
    },
  })

  await getServerAnalytics({
    localUser: getLocalUserFromUser(user),
    userId: user.id,
  })
    .track('User SMS Opt-In', {
      provider: 'twilio',
    })
    .flush()
}

export async function optOutUser(phoneNumber: string, isSWCKeyword: boolean, user?: User) {
  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_OUT,
    },
    where: {
      phoneNumber,
    },
  })

  if (isSWCKeyword) {
    await inngest.send({
      name: GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
      data: {
        phoneNumber,
      },
    })
  }

  if (user) {
    await getServerAnalytics({
      localUser: getLocalUserFromUser(user),
      userId: user.id,
    })
      .track('User SMS Opt-out', {
        type: isSWCKeyword ? 'SWC STOP Keyword' : 'STOP Keyword',
      })
      .flush()
  }
}

export async function optUserBackIn(phoneNumber: string, user?: User) {
  await prismaClient.user.updateMany({
    data: {
      smsStatus: SMSStatus.OPTED_IN,
    },
    where: {
      phoneNumber,
    },
  })

  await inngest.send({
    name: UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
    data: {
      phoneNumber,
    },
  })

  if (user) {
    await getServerAnalytics({
      localUser: getLocalUserFromUser(user),
      userId: user.id,
    })
      .track('User SMS Unstop')
      .flush()
  }
}
