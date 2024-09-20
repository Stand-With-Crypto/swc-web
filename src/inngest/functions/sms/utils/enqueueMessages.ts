import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'
import { update } from 'lodash-es'

import { getSMSVariablesByPhoneNumbers } from '@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import { countSegments, getUserByPhoneNumber } from '@/utils/server/sms/utils'
import { applySMSVariables } from '@/utils/server/sms/utils/variables'
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

const defaultLogger = getLogger('enqueueMessages')

export interface PayloadMessage {
  body?: string
  journeyType: UserCommunicationJourneyType
  campaignName?: string
  media?: string[]
}

export interface EnqueueMessagePayload {
  phoneNumber: string
  messages: PayloadMessage[]
}

export async function enqueueMessages(
  payload: EnqueueMessagePayload[],
  logger = defaultLogger,
  attempt = 0,
) {
  if (attempt > MAX_RETRY_ATTEMPTS) return { segments: 0, messages: 0 }
  if (payload.length > PAYLOAD_LIMIT) {
    throw new NonRetriableError(`Enqueue messages payload exceeded the limit ${PAYLOAD_LIMIT}`)
  }

  const invalidPhoneNumbers: string[] = []
  const failedPhoneNumbers: Record<string, EnqueueMessagePayload['messages']> = {}
  const messagesSentByJourneyType: {
    [key in UserCommunicationJourneyType]?: BulkCreateCommunicationJourneyPayload
  } = {}
  const unsubscribedUsers: string[] = []

  logger.info('Fetching variables')

  const userSMSVariables = await getSMSVariablesByPhoneNumbers(
    payload.map(({ phoneNumber }) => phoneNumber),
  )

  logger.info('Got variables')

  let segmentsSent = 0
  let queuedMessages = 0
  const enqueueMessagesPromise = payload.map(async ({ messages, phoneNumber }) => {
    for (const message of messages) {
      const { body, journeyType, campaignName, media } = message

      const variables = userSMSVariables[phoneNumber]

      try {
        if (body) {
          const queuedMessage = await sendSMS({
            body: applySMSVariables(body, variables),
            to: phoneNumber,
            media,
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

            segmentsSent += countSegments(queuedMessage.body)
            queuedMessages += 1
          }
        } else {
          update(
            messagesSentByJourneyType,
            [journeyType, campaignName ?? DEFAULT_CAMPAIGN_NAME],
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
          } else if (error.isUnsubscribedUser) {
            unsubscribedUsers.push(error.phoneNumber)
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

  logger.info(`Attempt ${attempt + 1} queuing messages`)

  await Promise.all(enqueueMessagesPromise)

  logger.info(`Attempt ${attempt + 1} queued ${queuedMessages} messages (${segmentsSent} segments)`)

  for (const journeyTypeKey of Object.keys(messagesSentByJourneyType)) {
    const journeyType = journeyTypeKey as UserCommunicationJourneyType

    logger.info(`Creating ${journeyType} communication journey`)

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

  const failedEnqueueMessagePayload: EnqueueMessagePayload[] = Object.keys(failedPhoneNumbers).map(
    phoneNumber => ({
      phoneNumber,
      messages: failedPhoneNumbers[phoneNumber],
    }),
  )

  // exponential backoff retry
  if (failedEnqueueMessagePayload.length > 0) {
    const waitingTime = 1000 * (attempt + 1)

    logger.info(
      `Failed to send SMS to ${failedEnqueueMessagePayload.length} phone numbers. Attempting again in ${waitingTime} millisecond`,
    )

    await sleep(waitingTime)

    const { messages, segments } = await enqueueMessages(
      failedEnqueueMessagePayload,
      logger,
      attempt + 1,
    )

    segmentsSent += segments
    queuedMessages += messages
  }

  logger.info('Messages queued successfully')

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
        if (message.media) {
          // Each image count as one segment in the queue
          segmentsCount += message.media.length
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
