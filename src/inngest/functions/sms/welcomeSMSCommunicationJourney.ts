import { CommunicationType, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'

import { createCommunicationJourney } from '@/inngest/functions/sms/shared'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { smsProvider } from '@/utils/shared/smsProvider'

import { sendSMS } from '@/lib/sms'
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

    const message = await step
      .run('send-sms', () => sendSMS({ body: messages.WELCOME_MESSAGE, to: phoneNumber }))
      .catch(async () => {
        await prismaClient.userCommunicationJourney.deleteMany({
          where: {
            id: {
              in: communicationJourneys.map(({ id }) => id),
            },
          },
        })
      })

    if (!message) {
      throw new Error('Failed to send SMS')
    }

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
