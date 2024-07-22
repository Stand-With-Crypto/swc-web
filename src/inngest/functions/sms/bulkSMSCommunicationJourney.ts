import { Prisma, SMSStatus, UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { parseISO } from 'date-fns'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { countSegments, sendSMS, TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { sleep } from '@/utils/shared/sleep'

import { createCommunication, createCommunicationJourneys } from './utils/communicationJourney'
import { fetchPhoneNumbers } from './utils/fetchPhoneNumbers'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME = 'app/user.communication/bulk.sms'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID = 'user-communication/bulk-sms'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = process.env.DATABASE_QUERY_LIMIT
  ? Number(process.env.DATABASE_QUERY_LIMIT)
  : undefined

// This constants are specific to our twilio phone number type
const MESSAGE_SEGMENTS_PER_SECOND = Number(
  requiredEnv(process.env.MESSAGE_SEGMENTS_PER_SECOND, 'MESSAGE_SEGMENTS_PER_SECOND'),
)
const MAX_QUEUE_LENGTH = Number(requiredEnv(process.env.MAX_QUEUE_LENGTH, 'MAX_QUEUE_LENGTH'))

const logger = getLogger('bulk-sms')

interface BulkSMSCommunicationJourneyPayload {
  smsBody?: string
  userWhereInput?: Prisma.UserGroupByArgs['where']
  includePendingDoubleOptIn?: boolean
  persist?: boolean
}

export const bulkSMSCommunicationJourney = inngest.createFunction(
  {
    id: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
    onFailure: onScriptFailure,
  },
  {
    event: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
  },
  async ({ step, event }) => {
    const { smsBody, userWhereInput, includePendingDoubleOptIn, persist } =
      event.data as BulkSMSCommunicationJourneyPayload

    if (!smsBody && persist) {
      throw new NonRetriableError('Missing sms body')
    }

    if (persist) {
      logger.info(`PERSIST flag ACTIVATED. Will send messages`)
    } else {
      logger.info(`PERSIST flag DEACTIVATED. Won't send any messages`)
    }

    // Messages with more than 160 characters are divided in segments
    const segmentsCount = countSegments(smsBody ?? '')

    // If there are multiple segment, we need to split the queue
    const queueSizeBySegment = Math.floor(MAX_QUEUE_LENGTH / segmentsCount)

    const [estimatedTimeToSendAllMessages, estimatedPhoneNumbersCount] = await step.run(
      'time-estimation',
      async () => {
        logger.info('Estimating...')

        let totalLength = 0
        let cursor: Date | undefined
        let hasNumbersLeft = true

        // We could do this using two other methods:
        // count() with distinct: not supported https://github.com/prisma/prisma/issues/4228. Would need a workaround that doesn't support custom userWhereInput
        // findMany() with distinct: there is a bug hat doesn't allow us to use LIMIT inside findMany when using distinct https://github.com/prisma/prisma/issues/13918
        while (hasNumbersLeft) {
          const phoneNumbers = await getPhoneNumberList(
            {
              where: {
                ...userWhereInput,
                datetimeCreated: {
                  gt: cursor,
                },
              },
              take: DATABASE_QUERY_LIMIT,
            },
            {
              includePendingDoubleOptIn,
            },
          )

          cursor = phoneNumbers.at(-1)?.datetimeCreated
          const length = phoneNumbers.length

          totalLength += length

          if (!DATABASE_QUERY_LIMIT || length < DATABASE_QUERY_LIMIT) {
            hasNumbersLeft = false
          }
        }

        const timeInSecondsToSendAllMessages =
          (totalLength * segmentsCount) / MESSAGE_SEGMENTS_PER_SECOND

        logger.info(
          `It will take ~${formatTime(timeInSecondsToSendAllMessages)} to send messages to ${totalLength} numbers`,
        )

        return [timeInSecondsToSendAllMessages, totalLength]
      },
    )

    let cursor: Date | undefined
    let loopIteration = 0
    let totalMessagesSent = 0
    let totalTimeTaken = 0
    let hasNumbersLeft = true
    while (hasNumbersLeft) {
      logger.info(`Iteration ${loopIteration}. Fetching phone numbers...`)
      const [phoneNumberChunks, newCursor, length] = await step.run(
        `fetch-users-iteration-${loopIteration}`,
        () =>
          fetchPhoneNumbers(
            (take, innerCursor = cursor) =>
              getPhoneNumberList(
                {
                  where: {
                    ...userWhereInput,
                    datetimeCreated: {
                      gt: innerCursor,
                    },
                  },
                  take,
                },
                {
                  includePendingDoubleOptIn,
                },
              ),
            {
              chunkSize: TWILIO_RATE_LIMIT,
              maxLength: queueSizeBySegment,
              queryLimit: DATABASE_QUERY_LIMIT,
            },
          ),
      )

      cursor = parseISO(newCursor)

      const timeInSecondsToSendBatchMessages =
        (length * segmentsCount) / MESSAGE_SEGMENTS_PER_SECOND

      logger.info(
        `Fetched ${length} phone numbers. Iteration ${loopIteration} will take ${formatTime(timeInSecondsToSendBatchMessages)} to send all messages`,
      )

      logger.info('Queuing messages...')
      totalMessagesSent += await step.run(
        `enqueue-messages-iteration-${loopIteration}`,
        async () => {
          let messagesSent = 0
          for (const batch of phoneNumberChunks) {
            messagesSent += await enqueueMessages(batch, smsBody, persist)
          }

          logger.info(`${loopIteration} iteration queued ${messagesSent} messages`)

          return messagesSent
        },
      )

      logger.info(
        `Queued a total of ${totalMessagesSent} messages. ${estimatedPhoneNumbersCount - totalMessagesSent} estimated messages remaining`,
      )

      logger.info(`Waiting ${formatTime(timeInSecondsToSendBatchMessages)}...`)

      if (persist) {
        await step.sleep(
          `wait-${formatTime(timeInSecondsToSendBatchMessages).replace(' ', '-')}-for-messaging-queue-to-be-empty`,
          timeInSecondsToSendBatchMessages * 1000,
        )
      }

      totalTimeTaken += timeInSecondsToSendBatchMessages
      logger.info(
        `Estimated time remaining: ${formatTime(estimatedTimeToSendAllMessages - totalTimeTaken)}. ${totalTimeTaken ? `Already took ${formatTime(totalTimeTaken)}` : ''}`,
      )

      if (length < queueSizeBySegment) {
        hasNumbersLeft = false
      }

      loopIteration += 1
    }

    logger.info('Finished')
  },
)

const ENQUEUE_MAX_RETRY_ATTEMPTS = 5

async function enqueueMessages(
  phoneNumbers: string[],
  body?: string,
  persist?: boolean,
  attempt = 0,
) {
  if (attempt > ENQUEUE_MAX_RETRY_ATTEMPTS) return 0

  const enqueueMessagesPromise = phoneNumbers.map(async phoneNumber => {
    if (!persist || !body) return

    const communicationJourneys = await createCommunicationJourneys(
      phoneNumber,
      UserCommunicationJourneyType.BULK_SMS,
    )

    const message = await sendSMS({
      body,
      to: phoneNumber,
    })

    if (message) {
      await createCommunication(communicationJourneys, message.sid)
    }

    return message
  })

  const failedPhoneNumbers: string[] = []

  let messagesSent = 0
  await Promise.allSettled(enqueueMessagesPromise).then(results => {
    results.forEach(result => {
      if (result.status === 'rejected') {
        if (result.reason) {
          if (result.reason.code === 20429 || result.reason.code === 'ECONNABORTED') {
            // Too Many Requests
            if ('phoneNumber' in result.reason) {
              failedPhoneNumbers.push(result.reason.phoneNumber)
            }
          } else if (result.reason.code === 21211) {
            // Invalid phone number
            // TODO: flag users with this phone number
          } else {
            Sentry.captureException('Unexpected Twilio error', {
              extra: { reason: result.reason },
              tags: {
                domain: 'bulkSMS',
              },
            })
          }
        } else {
          Sentry.captureException('Twilio failed with no reason', {
            extra: {
              reason: result.reason,
            },
            tags: {
              domain: 'bulkSMS',
            },
          })
        }
      } else {
        messagesSent += 1
      }
    })
  })

  // exponential backoff retry
  if (failedPhoneNumbers.length > 0) {
    await sleep(10000 * attempt)

    messagesSent += await enqueueMessages(failedPhoneNumbers, body, persist, attempt + 1)
  }

  return messagesSent
}

function formatTime(seconds: number) {
  if (seconds < SECONDS_DURATION.MINUTE) {
    return `${seconds.toPrecision(2)} seconds`
  } else if (seconds < SECONDS_DURATION.HOUR) {
    const minutes = Math.ceil(seconds / SECONDS_DURATION.MINUTE)
    return `${minutes} minutes`
  } else if (seconds < SECONDS_DURATION.DAY) {
    const hours = Math.ceil(seconds / SECONDS_DURATION.HOUR)
    return `${hours} hours`
  } else {
    const days = Math.ceil(seconds / SECONDS_DURATION.DAY)
    return `${days} days`
  }
}

interface GetPhoneNumberOptions {
  includePendingDoubleOptIn?: boolean
}

async function getPhoneNumberList(
  args: Omit<Prisma.UserGroupByArgs, 'by' | 'orderBy'>,
  options?: GetPhoneNumberOptions,
) {
  return prismaClient.user.groupBy({
    ...args,
    by: ['phoneNumber', 'datetimeCreated'],
    where: {
      ...args.where,
      smsStatus: {
        in: [
          SMSStatus.OPTED_IN,
          SMSStatus.OPTED_IN_HAS_REPLIED,
          ...(options?.includePendingDoubleOptIn ? [SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN] : []),
        ],
      },
    },
    having: {
      ...args.having,
      phoneNumber: {
        not: '',
      },
    },
    orderBy: [{ datetimeCreated: 'asc' }, { phoneNumber: 'asc' }],
  })
}
