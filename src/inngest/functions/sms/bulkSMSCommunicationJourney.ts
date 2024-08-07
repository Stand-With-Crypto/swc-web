import { Prisma, SMSStatus } from '@prisma/client'
import { NonRetriableError } from 'inngest'
import { chunk, uniq } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { countSegments, TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { enqueueMessages } from './utils'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME = 'app/user.communication/bulk.sms'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID = 'user-communication/bulk-sms'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

// This constants are specific to our twilio phone number type
const MESSAGE_SEGMENTS_PER_SECOND = Number(
  requiredEnv(process.env.MESSAGE_SEGMENTS_PER_SECOND, 'MESSAGE_SEGMENTS_PER_SECOND'),
)
const MAX_QUEUE_LENGTH = Number(requiredEnv(process.env.MAX_QUEUE_LENGTH, 'MAX_QUEUE_LENGTH'))

interface BulkSMSCommunicationJourneyPayload {
  smsBody?: string
  userWhereInput?: Prisma.UserGroupByArgs['where']
  includePendingDoubleOptIn?: boolean
  send?: boolean
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
  async ({ step, event, logger }) => {
    const { smsBody, userWhereInput, includePendingDoubleOptIn, send } =
      event.data as BulkSMSCommunicationJourneyPayload

    if (!smsBody && send) {
      throw new NonRetriableError('Missing sms body')
    }

    // Messages with more than 160 characters are divided in segments
    const segmentsCount = countSegments(smsBody ?? '')

    // If there are multiple segment, we need to split the queue
    const queueSizeBySegment = Math.floor(MAX_QUEUE_LENGTH / segmentsCount)

    let allPhoneNumbers: string[] = []
    let cursor: Date | undefined
    let hasNumbersLeft = true

    while (hasNumbersLeft) {
      const phoneNumbers = await getPhoneNumberList({
        includePendingDoubleOptIn,
        cursor,
        userWhereInput,
      })

      cursor = phoneNumbers.at(-1)?.datetimeCreated
      allPhoneNumbers = allPhoneNumbers.concat(phoneNumbers.map(({ phoneNumber }) => phoneNumber))

      if (!DATABASE_QUERY_LIMIT || phoneNumbers.length < DATABASE_QUERY_LIMIT) {
        hasNumbersLeft = false
      }
    }

    // Using uniq here to not send multiple messages to the same phone number
    const uniquePhoneNumbers = uniq(allPhoneNumbers)

    const totalPhoneNumbers = uniquePhoneNumbers.length

    // Each batch will be used to fill the queue
    const phoneNumberQueueBatches = chunk(uniquePhoneNumbers, queueSizeBySegment)

    const timeInSecondsToSendAllMessages =
      (totalPhoneNumbers * segmentsCount) / MESSAGE_SEGMENTS_PER_SECOND

    logger.info(`
      Time to send all messages: ${formatTime(timeInSecondsToSendAllMessages)}
      Total phone numbers: ${totalPhoneNumbers}
      Total batches: ${phoneNumberQueueBatches.length}
    `)

    if (!send) {
      return "Send flag is deactivated. Didn't send any messages"
    }

    let totalMessagesSent = 0
    let totalTimeTaken = 0
    let iteration = 0
    for (const queueBatch of phoneNumberQueueBatches) {
      // Split the batch into chunks to not exceed twilio's rate limit
      const phoneNumberChunks = chunk(queueBatch, TWILIO_RATE_LIMIT)

      totalMessagesSent += await step.run(`enqueue-messages`, async () => {
        let messagesSent = 0
        for (const phoneNumbers of phoneNumberChunks) {
          messagesSent += await enqueueMessages(phoneNumbers, smsBody!)
        }

        return messagesSent
      })

      const timeInSecondsToSendBatchMessages =
        (queueBatch.length * segmentsCount) / MESSAGE_SEGMENTS_PER_SECOND

      await step.sleep(
        `waiting-${formatTime(timeInSecondsToSendBatchMessages).replace(' ', '-')}-for-messaging-queue-to-be-empty`,
        timeInSecondsToSendBatchMessages * 1000,
      )

      totalTimeTaken += timeInSecondsToSendBatchMessages

      iteration += 1

      logger.info(`
        Messages: ${totalMessagesSent}/${totalPhoneNumbers}
        Time: ${formatTime(totalTimeTaken)}/${formatTime(timeInSecondsToSendAllMessages)}
        Iterations: ${iteration}/${phoneNumberQueueBatches.length}
      `)
    }

    return {
      Send: `${totalMessagesSent} messages`,
      Took: formatTime(totalTimeTaken),
    }
  },
)

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
  cursor?: Date
  userWhereInput?: BulkSMSCommunicationJourneyPayload['userWhereInput']
}

async function getPhoneNumberList(options: GetPhoneNumberOptions) {
  return prismaClient.user.groupBy({
    by: ['phoneNumber', 'datetimeCreated'],
    where: {
      ...options.userWhereInput,
      datetimeCreated: {
        gte: options.cursor,
      },
      hasValidPhoneNumber: true,
      smsStatus: {
        in: [
          SMSStatus.OPTED_IN,
          SMSStatus.OPTED_IN_HAS_REPLIED,
          ...(options.includePendingDoubleOptIn ? [SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN] : []),
        ],
      },
    },
    take: DATABASE_QUERY_LIMIT,
    orderBy: [{ datetimeCreated: 'asc' }, { phoneNumber: 'asc' }],
  })
}
