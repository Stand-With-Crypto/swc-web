import { UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { smsProvider } from '@/utils/shared/smsProvider'

import {
  createCommunication,
  createCommunicationJourney,
  CreatedCommunicationJourney,
} from './shared/communicationJourney'

import { messagingClient, sendSMS } from '@/lib/sms'
import * as messages from '@/lib/sms/messages'

export const WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/welcome.sms'

export const WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/welcome-sms'

const MAX_RETRY_COUNT = 3

interface WelcomeSMSCommunicationJourneyPayload {
  phoneNumber: string
}

export const welcomeSMSCommunicationJourney = inngest.createFunction(
  {
    id: WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  {
    event: WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  },
  async ({ event, step }) => {
    const { phoneNumber } = event.data as WelcomeSMSCommunicationJourneyPayload

    if (smsProvider !== 'twilio') return

    if (!phoneNumber) {
      throw new NonRetriableError('Missing phone number')
    }

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourney(phoneNumber, UserCommunicationJourneyType.WELCOME_SMS),
    )

    const message = await step.run('send-sms', () =>
      sendMessage(phoneNumber, communicationJourneys),
    )

    await step.run('create-user-communication', () =>
      createCommunication(communicationJourneys, message.sid),
    )

    await step.run('track-user-opt-in', () => trackOptIn(communicationJourneys))
  },
)

async function sendMessage(
  phoneNumber: string,
  communicationJourneys: CreatedCommunicationJourney,
) {
  for (const communicationJourney of communicationJourneys) {
    for (const communication of communicationJourney.userCommunications) {
      const messageSent = await messagingClient.messages(communication.messageId).fetch()

      if (messageSent.to === phoneNumber) {
        throw new NonRetriableError('Message was already sent to this phone number')
      }
    }
  }

  const message = await sendSMS({ body: messages.WELCOME_MESSAGE, to: phoneNumber })

  if (!message) {
    throw new Error('Failed to send SMS')
  }

  return message
}

async function trackOptIn(communicationJourneys: CreatedCommunicationJourney) {
  const userIds = communicationJourneys.map(({ userId }) => userId)

  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  })

  for (const user of users) {
    const localUser = getLocalUserFromUser(user)
    const analytics = getServerAnalytics({
      localUser,
      userId: user.id,
    })
    await analytics
      .track('User SMS Opt-In', {
        provider: 'twilio',
      })
      .flush()
  }
}
