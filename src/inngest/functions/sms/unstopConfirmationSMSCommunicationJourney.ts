import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { sendSMS } from '@/utils/server/sms'
import * as messages from '@/utils/server/sms/messages'

import { createCommunication, createCommunicationJourneys } from './utils/communicationJourney'
import { validatePhoneNumber } from './utils/validatePhoneNumber'

export const UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME =
  'app/user.communication/unstop-confirmation.sms'

export const UNSTOP_CONFIRMATION_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID =
  'user-communication/unstop-confirmation-sms'

const MAX_RETRY_COUNT = 3

interface UnstopConfirmationSMSCommunicationJourneyPayload {
  phoneNumber: string
}

// Please, never call this function manually, it should be called from "@/utils/server/sms/actions.ts"
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

    validatePhoneNumber(phoneNumber)

    const communicationJourneys = await step.run('create-communication-journey', () =>
      createCommunicationJourneys(
        phoneNumber,
        UserCommunicationJourneyType.UNSTOP_CONFIRMATION_SMS,
      ),
    )

    const message = await step.run('send-sms', () =>
      sendSMS({
        body: messages.UNSTOP_CONFIRMATION_MESSAGE,
        to: phoneNumber,
      }).catch(error => {
        Sentry.captureException(error, {
          tags: {
            domain: 'unstopSMS',
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
