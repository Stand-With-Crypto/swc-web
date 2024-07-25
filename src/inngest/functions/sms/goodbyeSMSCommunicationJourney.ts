import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendSMS } from '@/utils/server/sms'
import * as messages from '@/utils/server/sms/messages'

import { createCommunication, createCommunicationJourneys } from './utils/communicationJourney'
import { validatePhoneNumber } from './utils/validatePhoneNumber'

export const GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/goodbye.sms'

export const GOODBYE_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/goodbye-sms'

const MAX_RETRY_COUNT = 3

interface GoodbyeSMSCommunicationJourneyPayload {
  phoneNumber: string
}

// Please, never call this function manually, it should be called from "@/utils/server/sms/actions.ts"
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

    validatePhoneNumber(phoneNumber)

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourneys(phoneNumber, UserCommunicationJourneyType.GOODBYE_SMS),
    )

    const message = await step.run('send-sms', () =>
      sendSMS({
        body: messages.GOODBYE_MESSAGE,
        to: phoneNumber,
      }).catch(error => {
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
