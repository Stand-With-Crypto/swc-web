import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'
import { update } from 'lodash-es'

import {
  bulkCreateCommunicationJourney,
  BulkCreateCommunicationJourneyPayload,
} from '@/inngest/functions/sms/utils/communicationJourney'
import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils/flagInvalidPhoneNumbers'
import { getSMSVariablesByPhoneNumbers } from '@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers'
import { inngest } from '@/inngest/inngest'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import { countSegments, getUserByPhoneNumber } from '@/utils/server/sms/utils'
import { applySMSVariables, UserSMSVariables } from '@/utils/server/sms/utils/variables'
import { getLogger } from '@/utils/shared/logger'

export const ENQUEUE_SMS_INNGEST_EVENT_NAME = 'app/enqueue.sms'
const ENQUEUE_SMS_INNGEST_FUNCTION_ID = 'app.enqueue-sms'

const MAX_RETRY_COUNT = 0

export interface EnqueueMessagePayload {
  phoneNumber: string
  messages: Array<{
    body?: string
    journeyType: UserCommunicationJourneyType
    campaignName: string
    media?: string[]
  }>
}

export interface EnqueueSMSInngestEventSchema {
  name: typeof ENQUEUE_SMS_INNGEST_EVENT_NAME
  data: {
    payload: EnqueueMessagePayload[]
    variables?: EnqueueMessagesVariables
    attempt?: number
  }
}

export const enqueueSMS = inngest.createFunction(
  {
    id: ENQUEUE_SMS_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
  },
  {
    event: ENQUEUE_SMS_INNGEST_EVENT_NAME,
  },
  async ({ event, step, logger }) => {
    const { payload, variables, attempt = 0 } = event.data

    // This function has a built-in mechanism that retries only failed messages
    if (attempt >= 4) {
      throw new NonRetriableError(`SMS queuing attempt limit exceeded`)
    }

    // This mechanism reuses previous variables to save an Inngest step
    let userSMSVariables = variables
    if (!userSMSVariables) {
      logger.info('Fetching variables')

      userSMSVariables = await step.run('fetch-variables', () =>
        getSMSVariablesByPhoneNumbers(payload.map(({ phoneNumber }) => phoneNumber)),
      )
    }

    let totalQueuedMessages = 0
    let totalSegmentsSent = 0

    logger.info(`Attempt ${attempt + 1} queuing messages`)

    const enqueueMessagesResults = await step.run('enqueue-messages', () =>
      enqueueMessages(payload, userSMSVariables),
    )

    const {
      // Phone numbers that sendSMS returned a isTooManyRequests error. Messages are grouped by phone number. Ex: [{ [phoneNumber]: [failedMessageInfo] }]
      failedPhoneNumbers,
      queuedMessages,
      segmentsSent,
    } = enqueueMessagesResults

    logger.info(
      `Attempt ${attempt + 1} queued ${queuedMessages} messages (${segmentsSent} segments)`,
    )

    await step.run('persist-results-to-db', () =>
      persistEnqueueMessagesResults(enqueueMessagesResults, logger),
    )

    totalQueuedMessages += queuedMessages
    totalSegmentsSent += segmentsSent

    // Here we're creating the payload for the next execution of enqueueSMS, only with failed messages
    const failedEnqueueMessagePayload: EnqueueMessagePayload[] = Object.keys(
      failedPhoneNumbers,
    ).map(phoneNumber => ({
      phoneNumber,
      messages: failedPhoneNumbers[phoneNumber],
    }))

    if (failedEnqueueMessagePayload.length > 0) {
      const waitingTime = 1000 * (attempt * attempt)

      logger.info(
        `Failed to send SMS to ${failedEnqueueMessagePayload.length} phone numbers. Attempting again in ${waitingTime} millisecond`,
      )

      await step.sleep('wait-to-retry-failing-messages', waitingTime)

      const queuedFailedMessages = await step.invoke('enqueue-failed-messages', {
        function: enqueueSMS,
        data: {
          payload: failedEnqueueMessagePayload,
          attempt: attempt + 1,
          variables: userSMSVariables,
        },
      })

      totalQueuedMessages += queuedFailedMessages.queuedMessages
      totalSegmentsSent += queuedFailedMessages.segmentsSent
    }

    return {
      queuedMessages: totalQueuedMessages,
      segmentsSent: totalSegmentsSent,
    }
  },
)

type EnqueueMessagesVariables = Record<string, UserSMSVariables>

export async function enqueueMessages(
  payload: EnqueueMessagePayload[],
  variables: EnqueueMessagesVariables,
) {
  const invalidPhoneNumbers: string[] = []
  const failedPhoneNumbers: Record<string, EnqueueMessagePayload['messages']> = {}
  // Messages grouped by journey type and campaign name, Ex: BULK_SMS -> campaign-name: ["messageId"]
  const messagesSentByJourneyType: {
    [key in UserCommunicationJourneyType]?: BulkCreateCommunicationJourneyPayload
  } = {}
  const unsubscribedUsers: string[] = []

  let segmentsSent = 0
  let queuedMessages = 0

  const enqueueMessagesPromise = payload.map(async ({ messages, phoneNumber }) => {
    for (const message of messages) {
      const { body, journeyType, campaignName, media } = message

      const phoneNumberVariables = variables[phoneNumber] ?? {}

      try {
        if (body) {
          const queuedMessage = await sendSMS({
            body: applySMSVariables(body, phoneNumberVariables),
            to: phoneNumber,
            media,
          })

          if (queuedMessage) {
            update(
              messagesSentByJourneyType,
              [journeyType, campaignName],
              (existingPayload = []) => [
                ...existingPayload,
                {
                  messageId: queuedMessage.sid,
                  phoneNumber,
                },
              ],
            )

            segmentsSent += countSegments(queuedMessage.body)
            queuedMessages += 1
          }
        } else {
          // Bulk-SMS have logic to check if the phone number already received a welcome message, if it didn't it includes the welcome message at the end of the bulk message.
          // When doing this, it also adds a WELCOME_SMS journeyType to enqueueSMS payload, so we need to register that the user received the welcome legalese inside the bulk message
          update(messagesSentByJourneyType, [journeyType, campaignName], (existingPayload = []) => [
            ...existingPayload,
            {
              phoneNumber,
            },
          ])
        }
      } catch (error) {
        if (error instanceof NonRetriableError) {
          throw error
        }

        if (error instanceof SendSMSError) {
          if (error.isTooManyRequests) {
            return update(failedPhoneNumbers, [error.phoneNumber], (current = []) => [
              ...current,
              message,
            ])
          }
          if (error.isInvalidPhoneNumber) {
            return invalidPhoneNumbers.push(error.phoneNumber)
          }
          if (error.isUnsubscribedUser) {
            return unsubscribedUsers.push(error.phoneNumber)
          }

          return Sentry.captureException(`sendSMS Error ${error.code}: ${error.message}`, {
            extra: { reason: error },
            tags: {
              domain: 'enqueueMessages',
            },
          })
        }

        Sentry.captureException(`sendSMS unexpected Error: ${(error as any)?.message}`, {
          extra: {
            reason: error,
          },
          tags: {
            domain: 'enqueueMessages',
          },
        })
      }
    }
  })

  await Promise.all(enqueueMessagesPromise)

  return {
    invalidPhoneNumbers,
    failedPhoneNumbers,
    messagesSentByJourneyType,
    unsubscribedUsers,
    segmentsSent,
    queuedMessages,
  }
}

const defaultLogger = getLogger('persistEnqueueMessagesResults')

export async function persistEnqueueMessagesResults(
  {
    invalidPhoneNumbers,
    messagesSentByJourneyType,
    unsubscribedUsers,
  }: Awaited<ReturnType<typeof enqueueMessages>>,
  logger = defaultLogger,
) {
  // messagesSentByJourneyType have messages grouped by journeyType and campaignName
  for (const journeyTypeKey of Object.keys(messagesSentByJourneyType)) {
    const journeyType = journeyTypeKey as UserCommunicationJourneyType

    logger.info(`Creating ${journeyType} communication journey`)

    // We need to bulk create both communication and communication journey for better performance
    await bulkCreateCommunicationJourney(journeyType, messagesSentByJourneyType[journeyType]!)

    logger.info(`Created ${journeyType} communication journey`)
  }

  if (invalidPhoneNumbers.length > 0) {
    logger.info(`Found ${invalidPhoneNumbers.length} invalid phone numbers`)
    await flagInvalidPhoneNumbers(invalidPhoneNumbers)

    logger.info(`Invalid phone numbers flagged`)
  }

  if (unsubscribedUsers.length > 0) {
    logger.info(`Found ${unsubscribedUsers.length} unsubscribed users`)
    const optOutUserPromises = unsubscribedUsers.map(async phoneNumber => {
      const user = await getUserByPhoneNumber(phoneNumber)

      await optOutUser(phoneNumber, user)
    })

    await Promise.all(optOutUserPromises)

    logger.info(`Opted out ${unsubscribedUsers.length} users`)
  }
}
