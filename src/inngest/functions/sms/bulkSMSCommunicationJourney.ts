import { Prisma, SMSStatus, User, UserCommunicationJourneyType } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { parseISO } from 'date-fns'
import { NonRetriableError } from 'inngest'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { countSegments, sendSMS } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'
import { sleep } from '@/utils/shared/sleep'

import { createCommunication, createCommunicationJourneys } from './shared/communicationJourney'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME = 'app/user.communication/bulk.sms'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID = 'user-communication/bulk-sms'

const MAX_RETRY_COUNT = 0
const PLANET_SCALE_QUERY_LIMIT = 100_000

// This constants are specific to our twilio phone number type
const MESSAGE_SEGMENTS_PER_SECOND = 3
const MAX_QUEUE_LENGTH = 108_000

// This constant is specific to our twilio account
const QUEUING_THROUGHPUT = 500

const logger = getLogger('bulk-sms')

interface BulkSMSCommunicationJourneyPayload {
  smsBody: string
  userWhereInput?: Prisma.UserGroupByArgs['where']
  includePendingDoubleOptIn: boolean
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
    const { smsBody, userWhereInput, includePendingDoubleOptIn } =
      event.data as BulkSMSCommunicationJourneyPayload

    if (!smsBody) {
      throw new NonRetriableError('Missing sms body')
    }

    // Messages with more than 160 characters are divided in segments
    const segmentsCount = countSegments(smsBody)

    // If there are multiple segment, we need to split the queue
    const queueSizeBySegment = Math.floor(MAX_QUEUE_LENGTH / segmentsCount)

    // Iterations to get all phoneNumbers. We need this because PlanetScale limits the amount of rows
    const iterations = Math.ceil(queueSizeBySegment / PLANET_SCALE_QUERY_LIMIT)

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
              take: PLANET_SCALE_QUERY_LIMIT,
            },
            {
              includePendingDoubleOptIn,
            },
          )

          cursor = phoneNumbers.at(-1)?.datetimeCreated
          const length = phoneNumbers.length

          totalLength += length

          if (length < PLANET_SCALE_QUERY_LIMIT) {
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
    let phoneNumbersListLength = 0
    let totalMessagesSent = 0
    let totalTimeTaken = 0
    do {
      logger.info(`Iteration ${loopIteration}. Fetching phone numbers...`)
      const [phoneNumberChunks, newCursor] = await step.run(
        `fetch-users-iteration-${loopIteration}`,
        () => fetchPhoneNumbers(iterations, userWhereInput, cursor, includePendingDoubleOptIn),
      )

      cursor = parseISO(newCursor)
      phoneNumbersListLength = phoneNumberChunks.reduce((acc, curr) => acc + curr.length, 0)

      const timeInSecondsToSendBatchMessages =
        (phoneNumbersListLength * segmentsCount) / MESSAGE_SEGMENTS_PER_SECOND

      logger.info(
        `Fetched ${phoneNumbersListLength} phone numbers. Iteration ${loopIteration} will take ${formatTime(timeInSecondsToSendBatchMessages)} to send all messages`,
      )

      logger.info('Queuing messages...')
      totalMessagesSent += await step.run(
        `enqueue-messages-iteration-${loopIteration}`,
        async () => {
          let messagesSent = 0
          for (const batch of phoneNumberChunks) {
            messagesSent += await enqueueMessages(batch, smsBody)
          }

          logger.info(`${loopIteration} iteration queued ${messagesSent} messages`)

          return messagesSent
        },
      )

      logger.info(
        `Queued a total of ${totalMessagesSent} messages. ${estimatedPhoneNumbersCount - totalMessagesSent} estimated messages remaining`,
      )

      logger.info(`Waiting ${formatTime(timeInSecondsToSendBatchMessages)}...`)

      await step.sleep(
        `wait-${formatTime(timeInSecondsToSendBatchMessages).replace(' ', '-')}-for-messaging-queue-to-be-empty`,
        timeInSecondsToSendBatchMessages * 1000,
      )

      totalTimeTaken += timeInSecondsToSendBatchMessages
      logger.info(
        `Estimated time remaining: ${formatTime(estimatedTimeToSendAllMessages - totalTimeTaken)}. ${totalTimeTaken ? `Already took ${formatTime(totalTimeTaken)}` : ''}`,
      )

      loopIteration += 1
    } while (phoneNumbersListLength === queueSizeBySegment)

    logger.info('Finished')
  },
)

async function fetchPhoneNumbers(
  iterations: number,
  userWhereInput: BulkSMSCommunicationJourneyPayload['userWhereInput'],
  outerCursor?: Date,
  includePendingDoubleOptIn?: boolean,
): Promise<[string[][], Date | undefined]> {
  let phoneNumberList: Pick<User, 'phoneNumber' | 'datetimeCreated'>[] = []

  // Using cursor pagination to also send messages to users who registered while we wait for the queue to empty
  let innerCursor = outerCursor

  for (let i = 0; i < iterations; i += 1) {
    let take = MAX_QUEUE_LENGTH

    if (MAX_QUEUE_LENGTH >= PLANET_SCALE_QUERY_LIMIT) {
      take =
        i + 1 === iterations
          ? MAX_QUEUE_LENGTH - PLANET_SCALE_QUERY_LIMIT // If it's the last iteration we don't wanna go over the limit
          : PLANET_SCALE_QUERY_LIMIT
    }

    const phoneNumbers = await getPhoneNumberList(
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
    )

    phoneNumberList = phoneNumberList.concat(phoneNumbers)
    innerCursor = phoneNumbers.at(-1)?.datetimeCreated

    // Already fetched all phone numbers
    if (phoneNumbers.length < PLANET_SCALE_QUERY_LIMIT) {
      break
    }
  }

  // We need to simplify this array so that the payload doesn't exceed the 4MB limit that inngest has
  return [
    chunk(
      phoneNumberList.map(({ phoneNumber }) => phoneNumber),
      QUEUING_THROUGHPUT,
    ),
    innerCursor,
  ]
}

const ENQUEUE_MAX_RETRY_ATTEMPTS = 5

// TODO: implement some logic to not send duplicated messages
async function enqueueMessages(phoneNumbers: string[], body: string, attempt = 0) {
  if (attempt > ENQUEUE_MAX_RETRY_ATTEMPTS) return 0

  const enqueueMessagesPromise = phoneNumbers.map(async (phoneNumber, i) => {
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
            console.log(result.reason)
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

    messagesSent += await enqueueMessages(failedPhoneNumbers, body, attempt + 1)
  }

  return messagesSent
}

function formatTime(seconds: number) {
  if (seconds < 60) {
    return `${seconds.toPrecision(2)} seconds`
  } else if (seconds < 3600) {
    // less than 60 minutes (3600 seconds)
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minutes`
  } else if (seconds < 86400) {
    // less than 24 hours (86400 seconds)
    const hours = Math.ceil(seconds / 3600)
    return `${hours} hours`
  } else {
    // 24 hours or more
    const days = Math.ceil(seconds / 86400)
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
