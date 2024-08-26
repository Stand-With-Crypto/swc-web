import { Prisma, SMSStatus, UserCommunicationJourneyType } from '@prisma/client'
import { NonRetriableError } from 'inngest'
import { chunk, merge, uniq } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import { BULK_WELCOME_MESSAGE } from '@/utils/server/sms/messages'
import { isPhoneNumberSupported } from '@/utils/server/sms/utils'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { countMessagesAndSegments, EnqueueMessagePayload, enqueueMessages } from './utils'

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
  campaignName: string
  // Number of milliseconds or Time string compatible with the ms package, e.g. "30m", "3 hours", or "2.5d"
  sleepTime?: string | number
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
    const { smsBody, userWhereInput, includePendingDoubleOptIn, send, campaignName, sleepTime } =
      event.data as BulkSMSCommunicationJourneyPayload

    if (!smsBody) {
      throw new NonRetriableError('Missing sms body')
    }

    if (!campaignName) {
      throw new NonRetriableError('Missing campaign name')
    }

    const logInfo = (key: string, info: object) =>
      logger.info('bulk-info', key, JSON.stringify(info))

    // SMS messages over 160 characters are split into 153-character segments due to data headers.
    const getWaitingTimeInSeconds = (totalSegments: number) =>
      totalSegments / MESSAGE_SEGMENTS_PER_SECOND

    if (sleepTime) {
      await step.sleep('scheduled-sleep', sleepTime)
    }

    const phoneNumbersThatShouldReceiveWelcomeMessage = await fetchAllPhoneNumbers(
      {
        campaignName,
        includePendingDoubleOptIn,
        userWhereInput,
      },
      false,
    )

    let enqueueMessagesPayload: EnqueueMessagePayload[] =
      phoneNumbersThatShouldReceiveWelcomeMessage.map(phoneNumber => ({
        phoneNumber,
        messages: [
          {
            journeyType: UserCommunicationJourneyType.WELCOME_SMS,
          },
          {
            body: addWelcomeMessage(smsBody),
            campaignName,
            journeyType: UserCommunicationJourneyType.BULK_SMS,
          },
        ],
      }))

    const phoneNumberThatAlreadyReceivedWelcomeMessage = await fetchAllPhoneNumbers(
      {
        campaignName,
        includePendingDoubleOptIn,
        userWhereInput,
      },
      true,
    )

    enqueueMessagesPayload = enqueueMessagesPayload.concat(
      phoneNumberThatAlreadyReceivedWelcomeMessage.map(phoneNumber => ({
        phoneNumber,
        messages: [
          {
            body: smsBody,
            campaignName,
            journeyType: UserCommunicationJourneyType.BULK_SMS,
          },
        ],
      })),
    )

    const payloadChunks = chunk(enqueueMessagesPayload, TWILIO_RATE_LIMIT)

    const { segments: totalSegmentsToSend, messages: totalMessagesToSend } =
      countMessagesAndSegments(enqueueMessagesPayload)

    const totalTime = getWaitingTimeInSeconds(totalSegmentsToSend)

    const bulkInfo = {
      totalSegmentsToSend,
      totalMessagesToSend,
      totalMessagesWithWelcomeText: phoneNumbersThatShouldReceiveWelcomeMessage.length,
      totalTime: formatTime(totalTime),
      batches: payloadChunks.length,
    }

    if (!send) {
      return bulkInfo
    } else {
      logInfo('initial-info', bulkInfo)
    }

    let iteration = 0
    let hasMoreMessages = true
    let totalQueuedMessages = 0
    let totalQueuedSegments = 0
    let totalTimeTaken = 0
    while (hasMoreMessages) {
      const { queuedMessages, queuedSegments, timeToSendAllSegments } = await step.run(
        `enqueue-messages`,
        async () => {
          let queuedMessages = 0
          let queuedSegments = 0
          let hasSpaceLeftInQueue = true

          while (hasSpaceLeftInQueue) {
            const payloadChunk = payloadChunks[iteration]
            const nextPayload = payloadChunks[iteration + 1]

            // If we wont use the full queue, there's no need for this validation
            if (nextPayload && totalSegmentsToSend >= MAX_QUEUE_LENGTH) {
              const { segments: segmentsInNextPayload } = countMessagesAndSegments(nextPayload)

              if (queuedSegments + segmentsInNextPayload >= MAX_QUEUE_LENGTH) {
                hasSpaceLeftInQueue = false
                break
              }
            }

            if (!payloadChunk) {
              hasMoreMessages = false
              break
            }

            const { messages, segments } = await enqueueMessages(payloadChunk)

            queuedMessages += messages
            queuedSegments += segments

            if (!nextPayload) {
              hasMoreMessages = false
              break
            }

            iteration += 1
          }

          const timeToSendAllSegments = getWaitingTimeInSeconds(queuedSegments)

          return { queuedMessages, queuedSegments, timeToSendAllSegments }
        },
      )

      if (queuedSegments === 0) {
        hasMoreMessages = false
        break
      }

      totalQueuedMessages += queuedMessages
      totalQueuedSegments += queuedSegments

      await step.sleep(
        `waiting-${formatTime(timeToSendAllSegments).replace(' ', '-')}-for-messaging-queue-to-be-empty`,
        timeToSendAllSegments * 1000,
      )

      totalTimeTaken += timeToSendAllSegments

      logInfo('summary-info', {
        totalTimeTaken: formatTime(totalTimeTaken),
        totalQueuedMessages,
        totalQueuedSegments,
      })
    }

    return {
      totalQueuedMessages,
      totalQueuedSegments,
      totalTimeTaken: formatTime(totalTimeTaken),
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

const mergeWhereParams = merge<Prisma.UserGroupByArgs['where'], Prisma.UserGroupByArgs['where']>

// Add a space before the welcome message to ensure proper formatting. If the message ends with a link,
// appending the welcome message directly could break the link.
const addWelcomeMessage = (message: string) => message + ` \n\n${BULK_WELCOME_MESSAGE}`

interface GetPhoneNumberOptions {
  includePendingDoubleOptIn?: boolean
  cursor?: Date
  userWhereInput?: BulkSMSCommunicationJourneyPayload['userWhereInput']
  campaignName?: string
}

async function fetchAllPhoneNumbers(
  options: Omit<GetPhoneNumberOptions, 'cursor'>,
  hasWelcomeMessage: boolean,
) {
  let allPhoneNumbers: string[] = []
  let cursor: Date | undefined
  let hasNumbersLeft = true

  const customWhere = mergeWhereParams(
    { ...options.userWhereInput },
    {
      UserCommunicationJourney: hasWelcomeMessage
        ? {
            some: {
              journeyType: UserCommunicationJourneyType.WELCOME_SMS,
            },
          }
        : {
            every: {
              journeyType: {
                not: UserCommunicationJourneyType.WELCOME_SMS,
              },
            },
          },
    },
  )

  while (hasNumbersLeft) {
    const phoneNumberList = await getPhoneNumberList({
      ...options,
      cursor,
      userWhereInput: customWhere,
    })

    cursor = phoneNumberList.at(-1)?.datetimeCreated

    const phoneNumbers = phoneNumberList
      .map(({ phoneNumber }) => phoneNumber)
      .filter(isPhoneNumberSupported)

    allPhoneNumbers = allPhoneNumbers.concat(phoneNumbers)

    if (!DATABASE_QUERY_LIMIT || phoneNumbers.length < DATABASE_QUERY_LIMIT) {
      hasNumbersLeft = false
    }
  }

  // Using uniq here to not send multiple messages to the same phone number
  return uniq(allPhoneNumbers)
}

async function getPhoneNumberList(options: GetPhoneNumberOptions) {
  return prismaClient.user.groupBy({
    by: ['phoneNumber', 'datetimeCreated'],
    where: {
      ...mergeWhereParams(
        { ...options.userWhereInput },
        {
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
        },
      ),
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
