import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'

import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import * as messages from '@/utils/server/sms/messages'

import { createCommunication, createCommunicationJourneys } from './utils/communicationJourney'

export const WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/welcome.sms'

export const WELCOME_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/welcome-sms'

const MAX_RETRY_COUNT = 3

interface WelcomeSMSCommunicationJourneyPayload {
  phoneNumber: string
}

// Please, never call this function manually, it should be called from "@/utils/server/sms/actions.ts"
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

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourneys(phoneNumber, UserCommunicationJourneyType.WELCOME_SMS),
    )

    const message = await step.run('send-sms', () =>
      sendSMS({
        body: messages.WELCOME_MESSAGE,
        to: phoneNumber,
      }).catch(error => {
        if (error instanceof SendSMSError) {
          if (error.isInvalidPhoneNumber) {
            return flagInvalidPhoneNumbers([phoneNumber])
          }
        }

        Sentry.captureException(error, {
          tags: {
            domain: 'welcomeSMS',
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
