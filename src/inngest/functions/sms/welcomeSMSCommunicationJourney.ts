import { UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { messagingClient, sendSMS } from '@/utils/server/sms'
import * as messages from '@/utils/server/sms/messages'
import { smsProvider } from '@/utils/shared/smsProvider'

import {
  createCommunication,
  createCommunicationJourneys,
  CreatedCommunicationJourneys,
} from './shared/communicationJourney'
import { validatePhoneNumber } from './shared/validatePhoneNumber'

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

    validatePhoneNumber(phoneNumber)

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourneys(phoneNumber, UserCommunicationJourneyType.WELCOME_SMS),
    )

    const message = await step.run('send-sms', () =>
      sendMessage(phoneNumber, communicationJourneys),
    )

    await step.run('create-user-communication', () =>
      createCommunication(communicationJourneys, message.sid),
    )
  },
)

async function sendMessage(
  phoneNumber: string,
  communicationJourneys: CreatedCommunicationJourneys,
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
