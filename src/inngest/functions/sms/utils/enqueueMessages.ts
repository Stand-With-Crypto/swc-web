import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'

import { countSegments, sendSMS, SendSMSError } from '@/utils/server/sms'
import { sleep } from '@/utils/shared/sleep'

import { createCommunication, createCommunicationJourneys, flagInvalidPhoneNumbers } from '.'

const ENQUEUE_MAX_RETRY_ATTEMPTS = 5

export interface PayloadMessage {
  body: string
  journeyType: UserCommunicationJourneyType
  campaignName?: string
}

export interface EnqueueMessagePayload {
  phoneNumber: string
  messages: PayloadMessage[]
}

export async function enqueueMessages(payload: EnqueueMessagePayload[], attempt = 0) {
  if (attempt > ENQUEUE_MAX_RETRY_ATTEMPTS) return { segments: 0, messages: 0 }

  const invalidPhoneNumbers: string[] = []
  const failedPhoneNumbers: Record<string, EnqueueMessagePayload['messages']> = {}

  let segmentsSent = 0
  let queuedMessages = 0
  const enqueueMessagesPromise = payload.map(async ({ messages, phoneNumber }) => {
    for (const message of messages) {
      const { body, journeyType, campaignName } = message

      try {
        const communicationJourneys = await createCommunicationJourneys(
          phoneNumber,
          journeyType,
          campaignName,
        )

        const queuedMessage = await sendSMS({
          body,
          to: phoneNumber,
        })

        if (queuedMessage) {
          await createCommunication(communicationJourneys, queuedMessage.sid)
        }

        segmentsSent += countSegments(body)
        queuedMessages += 1
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
            Sentry.captureException('Unexpected sendSMS error', {
              extra: { reason: error },
              tags: {
                domain: 'enqueueMessages',
              },
            })
          }
        } else if (error instanceof NonRetriableError) {
          throw error
        } else {
          Sentry.captureException('sendSMS failed with no reason', {
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

  if (invalidPhoneNumbers.length > 0) {
    await flagInvalidPhoneNumbers(invalidPhoneNumbers)
  }

  const newPayload: EnqueueMessagePayload[] = Object.keys(failedPhoneNumbers).map(phoneNumber => ({
    phoneNumber,
    messages: failedPhoneNumbers[phoneNumber],
  }))

  // exponential backoff retry
  if (newPayload.length > 0) {
    await sleep(10000 * (attempt + 1))

    const { messages, segments } = await enqueueMessages(newPayload, attempt + 1)

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
        segmentsCount += countSegments(message.body)
      })

      return {
        messages: acc.messages + curr.messages.length,
        segments: acc.segments + segmentsCount,
      }
    },
    {
      segments: 0,
      messages: 0,
    },
  )
}
