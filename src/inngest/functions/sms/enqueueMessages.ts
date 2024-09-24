import { UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NonRetriableError } from 'inngest'
import { update } from 'lodash-es'

import { flagInvalidPhoneNumbers } from '@/inngest/functions/sms/utils'
import {
  bulkCreateCommunicationJourney,
  BulkCreateCommunicationJourneyPayload,
  DEFAULT_CAMPAIGN_NAME,
} from '@/inngest/functions/sms/utils/communicationJourney'
import { getSMSVariablesByPhoneNumbers } from '@/inngest/functions/sms/utils/getSMSVariablesByPhoneNumbers'
import { inngest } from '@/inngest/inngest'
import { sendSMS, SendSMSError } from '@/utils/server/sms'
import { optOutUser } from '@/utils/server/sms/actions'
import { countSegments, getUserByPhoneNumber } from '@/utils/server/sms/utils'
import { applySMSVariables } from '@/utils/server/sms/utils/variables'

export const ENQUEUE_SMS_INNGEST_EVENT_NAME = 'app/enqueue.sms'
const ENQUEUE_SMS_INNGEST_FUNCTION_ID = 'app.enqueue-sms'

const MAX_RETRY_COUNT = 0

interface PayloadMessage {
  body?: string
  journeyType: UserCommunicationJourneyType
  campaignName?: string
  media?: string[]
}

export interface EnqueueMessagePayload {
  phoneNumber: string
  messages: PayloadMessage[]
}

export interface EnqueueSMSInngestEventSchema {
  name: typeof ENQUEUE_SMS_INNGEST_EVENT_NAME
  data: {
    payload: EnqueueMessagePayload[]
    variables?: Awaited<ReturnType<typeof getSMSVariablesByPhoneNumbers>>
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

    if (attempt >= 4) {
      throw new NonRetriableError(`SMS queuing attempt limit exceeded`)
    }

    let userSMSVariables = variables
    if (!userSMSVariables) {
      logger.info('Fetching variables')

      userSMSVariables = await step.run('fetch-variables', () =>
        getSMSVariablesByPhoneNumbers(payload.map(({ phoneNumber }) => phoneNumber)),
      )
    }

    let totalQueuedMessages = 0
    let totalSegmentsSent = 0

    const {
      failedPhoneNumbers,
      invalidPhoneNumbers,
      messagesSentByJourneyType,
      queuedMessages,
      segmentsSent,
      unsubscribedUsers,
    } = await step.run('enqueue-messages', async () => {
      const invalidPhoneNumbers: string[] = []
      const failedPhoneNumbers: Record<string, EnqueueMessagePayload['messages']> = {}
      const messagesSentByJourneyType: {
        [key in UserCommunicationJourneyType]?: BulkCreateCommunicationJourneyPayload
      } = {}
      const unsubscribedUsers: string[] = []

      let segmentsSent = 0
      let queuedMessages = 0

      const enqueueMessagesPromise = payload.map(async ({ messages, phoneNumber }) => {
        for (const message of messages) {
          const { body, journeyType, campaignName, media } = message

          const phoneNumberVariables = userSMSVariables[phoneNumber]

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

      logger.info(
        `Attempt ${attempt + 1} queued ${queuedMessages} messages (${segmentsSent} segments)`,
      )

      return {
        invalidPhoneNumbers,
        failedPhoneNumbers,
        messagesSentByJourneyType,
        unsubscribedUsers,
        segmentsSent,
        queuedMessages,
      }
    })

    await step.run('persist-results-to-db', async () => {
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
    })

    totalQueuedMessages += queuedMessages
    totalSegmentsSent += segmentsSent

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
