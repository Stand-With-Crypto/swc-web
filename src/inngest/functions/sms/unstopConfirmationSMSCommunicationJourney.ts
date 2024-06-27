import { UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

import { createCommunication, createCommunicationJourneys } from './shared/communicationJourney'

import { sendSMS } from '@/lib/sms'
import * as messages from '@/lib/sms/messages'

export const UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/unstop-confirmation.sms'

export const UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/unstop-confirmation-sms'

const MAX_RETRY_COUNT = 3

interface UnstopConfirmationSMSCommunicationJourneyPayload {
  phoneNumber: string
}

export const unstopConfirmationSMSCommunicationJourney = inngest.createFunction(
  {
    id: UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  {
    event: UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  },
  async ({ event, step }) => {
    const { phoneNumber } = event.data as UnstopConfirmationSMSCommunicationJourneyPayload

    if (!phoneNumber) {
      throw new NonRetriableError('Missing phone number')
    }

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourneys(
        phoneNumber,
        UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
      ),
    )

    const message = await step.run('send-sms', () =>
      sendSMS({
        body: messages.GOODBYE_MESSAGE,
        to: phoneNumber,
      }),
    )

    if (!message) {
      throw new Error('Failed to send SMS')
    }

    await step.run('create-user-communication', () =>
      createCommunication(communicationJourneys, message.sid),
    )
  },
)
