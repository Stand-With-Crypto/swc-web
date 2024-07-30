import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import * as messages from '@/utils/server/sms/messages'

import { createCommunication, createCommunicationJourneys, flagInvalidPhoneNumbers } from './utils'

export const GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/goodbye.sms'

export const GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/goodbye-sms'

const MAX_RETRY_COUNT = 3

interface GoodbyeSMSCommunicationJourneyPayload {
  phoneNumber: string
}

export const goodbyeSMSCommunicationJourney = inngest.createFunction(
  {
    id: GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  {
    event: GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  },
  async ({ event, step }) => {
    const { phoneNumber } = event.data as GoodbyeSMSCommunicationJourneyPayload

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourneys(phoneNumber, UserCommunicationJourneyType.GOODBYE_SMS),
    )

    const message = await step.run('send-sms', () =>
      sendSMS({
        body: messages.GOODBYE_MESSAGE,
        to: phoneNumber,
      }).catch(error => {
        if (error instanceof SendSMSError) {
          if (error.isInvalidPhoneNumber) {
            return flagInvalidPhoneNumbers([phoneNumber])
          }
        }

        Sentry.captureException(error, {
          tags: {
            domain: 'goodbyeSMS',
          },
        })
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
