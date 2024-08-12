import { Prisma, SMSStatus, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'
import { chunk, merge, uniq } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { countSegments, TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import * as messages from '@/utils/server/sms/messages'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { enqueueMessages } from './utils'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME = 'app/user.communication/bulk.sms'
export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FINISHED_EVENT_NAME =
  'app/user.communication/bulk.sms/finished'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID = 'user-communication/bulk-sms'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

// This constants are specific to our twilio phone number type
const MESSAGE_SEGMENTS_PER_SECOND = Number(
  requiredEnv(process.env.MESSAGE_SEGMENTS_PER_SECOND, 'MESSAGE_SEGMENTS_PER_SECOND'),
)
const MAX_QUEUE_LENGTH = Number(requiredEnv(process.env.MAX_QUEUE_LENGTH, 'MAX_QUEUE_LENGTH'))

interface BulkSMSCommunicationJourneyPayload {
  smsBody: string
  userWhereInput?: Prisma.UserGroupByArgs['where']
  includePendingDoubleOptIn?: boolean
  send?: boolean
  journeyType?: UserCommunicationJourneyType
  campaignName: string
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
    const { smsBody, userWhereInput, includePendingDoubleOptIn, send, journeyType, campaignName } =
      event.data as BulkSMSCommunicationJourneyPayload

    if (!smsBody) {
      throw new NonRetriableError('Missing sms body')
    }

    if (!campaignName) {
      throw new NonRetriableError('Missing campaign name')
    }

    const communicationJourneyType = journeyType
      ? UserCommunicationJourneyType[journeyType]
      : UserCommunicationJourneyType.BULK_SMS

    if (!communicationJourneyType) {
      throw new NonRetriableError(`Invalid journeyType ${journeyType ?? 'undefined'}`)
    }

    if (communicationJourneyType !== UserCommunicationJourneyType.WELCOME_SMS) {
      const bulkWelcomeSMSPayload: BulkSMSCommunicationJourneyPayload = {
        ...event.data,
        smsBody: messages.WELCOME_MESSAGE,
        journeyType: UserCommunicationJourneyType.WELCOME_SMS,
        userWhereInput: {
          ...userWhereInput,
          UserCommunicationJourney: {
            every: {
              journeyType: {
                not: 'WELCOME_SMS',
              },
            },
          },
        },
      }

      const {
        ids: [bulkWelcomeSMSEventId],
      } = await step.run('trigger-bulk-welcome-sms', () =>
        inngest.send({
          name: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME,
          data: bulkWelcomeSMSPayload,
        }),
      )

      await step.waitForEvent('wait-for-welcome-sms-to-finish', {
        event: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FINISHED_EVENT_NAME,
        timeout: '4 days',
        if: `async.data.id == '${bulkWelcomeSMSEventId}'`,
      })
    }

    // Messages with more than 160 characters are divided in segments
    const segmentsCount = countSegments(smsBody)

    const getWaitingTimeInSeconds = (messageCount: number) =>
      (messageCount * segmentsCount) / MESSAGE_SEGMENTS_PER_SECOND

    // If there are multiple segment, we need to split the queue
    const queueSizeBySegment = Math.floor(MAX_QUEUE_LENGTH / segmentsCount)

    let allPhoneNumbers: string[] = []
    let cursor: Date | undefined
    let hasNumbersLeft = true

    while (hasNumbersLeft) {
      const phoneNumberList = await getPhoneNumberList({
        includePendingDoubleOptIn,
        cursor,
        userWhereInput,
      })

      cursor = phoneNumberList.at(-1)?.datetimeCreated

      const phoneNumbers = phoneNumberList.map(({ phoneNumber }) => phoneNumber)

      allPhoneNumbers = allPhoneNumbers.concat(phoneNumbers)

      if (!DATABASE_QUERY_LIMIT || phoneNumbers.length < DATABASE_QUERY_LIMIT) {
        hasNumbersLeft = false
      }
    }

    // Using uniq here to not send multiple messages to the same phone number
    allPhoneNumbers = uniq(allPhoneNumbers)

    const totalPhoneNumbers = allPhoneNumbers.length

    // Each batch will be used to fill the queue
    const phoneNumbersQueueBatches = chunk(allPhoneNumbers, queueSizeBySegment)

    const totalTimeToSendAllMessages = getWaitingTimeInSeconds(totalPhoneNumbers)

    const bulkInfo = {
      Segments: segmentsCount,
      'Time to send messages': formatTime(totalTimeToSendAllMessages),
      'Number of messages': totalPhoneNumbers,
      Batches: phoneNumbersQueueBatches.length,
    }

    if (!send) {
      await step.sendEvent('emit-finished-estimating-bulk-sms', {
        name: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FINISHED_EVENT_NAME,
        data: {
          id: event.id,
        },
      })

      return bulkInfo
    } else {
      logger.info('bulk-info', JSON.stringify(bulkInfo))
    }

    let totalQueuedMessages = 0
    let totalTimeTaken = 0
    let iteration = 0
    for (const queueBatch of phoneNumbersQueueBatches) {
      totalQueuedMessages += await step.run(`enqueue-bulk-messages`, async () => {
        // Split the batch into chunks to avoid exceeding Twilio's rate limit
        const phoneNumberChunks = chunk(queueBatch, TWILIO_RATE_LIMIT)

        let queuedMessages = 0
        for (const phoneNumbers of phoneNumberChunks) {
          queuedMessages += await enqueueMessages(phoneNumbers, {
            body: smsBody,
            journeyType: communicationJourneyType,
            campaignName,
          })
        }

        return queuedMessages
      })

      const timeToSendAllBatchMessages = getWaitingTimeInSeconds(totalQueuedMessages)

      await step.sleep(
        `waiting-${formatTime(timeToSendAllBatchMessages).replace(' ', '-')}-for-messaging-queue-to-be-empty`,
        timeToSendAllBatchMessages * 1000,
      )

      totalTimeTaken += timeToSendAllBatchMessages

      iteration += 1

      logger.info(
        'bulk-info',
        JSON.stringify({
          Messages: totalQueuedMessages,
          Time: `${formatTime(totalTimeTaken)}/${formatTime(totalTimeToSendAllMessages)}`,
          Iterations: `${iteration}/${phoneNumbersQueueBatches.length}`,
        }),
      )
    }

    await step.sendEvent('emit-finished-sending-bulk-messages', {
      name: BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FINISHED_EVENT_NAME,
      data: {
        id: event.id,
      },
    })

    return {
      Send: totalQueuedMessages,
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
  campaignName?: string
}

async function getPhoneNumberList(options: GetPhoneNumberOptions) {
  return prismaClient.user.groupBy({
    by: ['phoneNumber', 'datetimeCreated'],
    where: {
      ...merge(options.userWhereInput, {
        datetimeCreated: {
          gte: options.cursor,
        },
        UserCommunicationJourney: {
          every: {
            campaignName: {
              not: options.campaignName,
            },
          },
        },
      }),
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
