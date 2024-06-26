import {
  CommunicationType,
  UserCommunication,
  UserCommunicationJourney,
  UserCommunicationJourneyType,
} from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { smsProvider } from '@/utils/shared/smsProvider'

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

    await step.run('create-user-communication', async () => {
      await prismaClient.userCommunication.createMany({
        data: communicationJourneys.map(({ id }) => ({
          communicationType: CommunicationType.SMS,
          messageId: message.sid,
          userCommunicationJourneyId: id,
        })),
      })
    })
  },
)

async function createCommunicationJourney(
  phoneNumber: string,
  journeyType: UserCommunicationJourneyType,
): Promise<CommunicationJourney[]> {
  const usersWithPhoneNumber = (
    await prismaClient.user.findMany({
      where: {
        phoneNumber,
      },
      select: {
        id: true,
      },
    })
  ).map(({ id }) => id)

  if (usersWithPhoneNumber.length === 0) {
    throw new NonRetriableError('User not found')
  }

  const usersWithExistingCommunicationJourney = (
    await prismaClient.userCommunicationJourney.findMany({
      where: {
        userId: {
          in: usersWithPhoneNumber,
        },
        journeyType,
      },
      select: {
        userId: true,
      },
    })
  ).map(({ userId }) => userId)

  await prismaClient.userCommunicationJourney.createMany({
    data: usersWithPhoneNumber
      .filter(id => !usersWithExistingCommunicationJourney.includes(id))
      .map(id => ({
        userId: id,
        journeyType,
      })),
  })

  return prismaClient.userCommunicationJourney.findMany({
    where: {
      userId: {
        in: usersWithPhoneNumber,
      },
      journeyType,
    },
    select: {
      id: true,
      userCommunications: {
        select: {
          messageId: true,
        },
      },
    },
  })
}

type CommunicationJourney = {
  id: UserCommunicationJourney['id']
  userCommunications: Array<{
    messageId: UserCommunication['messageId']
  }>
}

async function sendMessage(phoneNumber: string, communicationJourneys: CommunicationJourney[]) {
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
