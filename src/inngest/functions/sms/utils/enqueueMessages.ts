import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'
import { update } from 'lodash-es'

import { countSegments, sendSMS, SendSMSError } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'
import { sleep } from '@/utils/shared/sleep'

import {
  bulkCreateCommunicationJourney,
  BulkCreateCommunicationJourneyPayload,
  DEFAULT_CAMPAIGN_NAME,
} from './communicationJourney'
import { flagInvalidPhoneNumbers } from './flagInvalidPhoneNumbers'

const MAX_RETRY_ATTEMPTS = 5
const PAYLOAD_LIMIT = 10000

const logger = getLogger('enqueueMessages')

export interface PayloadMessage {
  body?: string
  journeyType: UserCommunicationJourneyType
  campaignName?: string
}

export interface EnqueueMessagePayload {
  phoneNumber: string
  messages: PayloadMessage[]
}

export async function enqueueMessages(payload: EnqueueMessagePayload[], attempt = 0) {
  if (attempt > MAX_RETRY_ATTEMPTS) return { segments: 0, messages: 0 }
  if (payload.length > PAYLOAD_LIMIT) {
    throw new NonRetriableError(`Enqueue messages payload exceeded the limit ${PAYLOAD_LIMIT}`)
  }

  const invalidPhoneNumbers: string[] = []
  const failedPhoneNumbers: Record<string, EnqueueMessagePayload['messages']> = {}
  const messagesSentByJourneyType: {
    [key in UserCommunicationJourneyType]?: BulkCreateCommunicationJourneyPayload
  } = {}

  let segmentsSent = 0
  let queuedMessages = 0
  const enqueueMessagesPromise = payload.map(async ({ messages, phoneNumber }) => {
    for (const message of messages) {
      const { body, journeyType, campaignName } = message

      try {
        if (body) {
          const queuedMessage = await sendSMS({
            body,
            to: phoneNumber,
          })

          if (queuedMessage) {
            update(
              messagesSentByJourneyType,
              [journeyType, campaignName ?? DEFAULT_CAMPAIGN_NAME],
              (existingPayload = []) => [
                ...existingPayload,
                {
                  messageId: queuedMessage.sid,
                  phoneNumber,
                },
              ],
            )
          }

          segmentsSent += countSegments(body)
          queuedMessages += 1
        } else if (journeyType === UserCommunicationJourneyType.WELCOME_SMS) {
          // TODO: remove this when we finish testing the new welcome sms variant
          update(
            messagesSentByJourneyType,
            [journeyType, DEFAULT_CAMPAIGN_NAME],
            (existingPayload = []) => [
              ...existingPayload,
              {
                phoneNumber,
              },
            ],
          )
        }
      } catch (error) {
        if (error instanceof SendSMSError) {
          if (error.isTooManyRequests) {
            if (failedPhoneNumbers[error.phoneNumber]) {
              failedPhoneNumbers[error.phoneNumber].push(message)
            } else {
              failedPhoneNumbers[error.phoneNumber] = [message]
            }
          } else if (error.isInvalidPhoneNumber) {
            invalidPhoneNumbers.push(error.phoneNumber)
          } else {
            Sentry.captureException(`sendSMS Error ${error.code}: ${error.message}`, {
              extra: { reason: error },
              tags: {
                domain: 'enqueueMessages',
              },
            })
          }
        } else if (error instanceof NonRetriableError) {
          throw error
        } else {
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
    }
  })

  await Promise.all(enqueueMessagesPromise)

  logger.info(`Attempt ${attempt + 1} queued ${queuedMessages} messages (${segmentsSent} segments)`)

  for (const journeyTypeKey of Object.keys(messagesSentByJourneyType)) {
    const journeyType = journeyTypeKey as UserCommunicationJourneyType

    logger.info(`Creating ${journeyType} communication journey`)

    await bulkCreateCommunicationJourney(journeyType, messagesSentByJourneyType[journeyType]!)
  }

  if (invalidPhoneNumbers.length > 0) {
    logger.info(`Found ${invalidPhoneNumbers.length} invalid phone numbers`)
    await flagInvalidPhoneNumbers(invalidPhoneNumbers)
  }

  const failedEnqueueMessagePayload: EnqueueMessagePayload[] = Object.keys(failedPhoneNumbers).map(
    phoneNumber => ({
      phoneNumber,
      messages: failedPhoneNumbers[phoneNumber],
    }),
  )

  // exponential backoff retry
  if (failedEnqueueMessagePayload.length > 0) {
    const waitingTime = 10000 * (attempt + 1)

    logger.info(
      `Failed to send SMS to ${failedEnqueueMessagePayload.length} phone numbers. Attempting again in ${waitingTime} seconds`,
    )

    await sleep(waitingTime)

    const { messages, segments } = await enqueueMessages(failedEnqueueMessagePayload, attempt + 1)

    segmentsSent += segments
    queuedMessages += messages
  }

  return { segments: segmentsSent, messages: queuedMessages }
}

export function countMessagesAndSegments(payload: EnqueueMessagePayload[]) {
  return payload.reduce(
    (acc, curr) => {
      let segmentsCount = 0

      curr.messages.forEach(message => {
        if (message.body) {
          segmentsCount += countSegments(message.body)
        }
      })

      return {
        messages: acc.messages + curr.messages.filter(({ body }) => !!body).length,
        segments: acc.segments + segmentsCount,
      }
    },
    {
      segments: 0,
      messages: 0,
    },
  )
}
