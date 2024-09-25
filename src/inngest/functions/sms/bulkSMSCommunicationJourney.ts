import { Prisma, SMSStatus, UserCommunicationJourneyType } from '@prisma/client'
import { addDays, addHours, addSeconds, differenceInMilliseconds, startOfDay } from 'date-fns'
import { NonRetriableError } from 'inngest'
import { chunk, merge, uniq, update } from 'lodash-es'

import { EnqueueMessagePayload, enqueueSMS } from '@/inngest/functions/sms/enqueueMessages'
import { countMessagesAndSegments } from '@/inngest/functions/sms/utils/countMessagesAndSegments'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import { BULK_WELCOME_MESSAGE } from '@/utils/server/sms/messages'
import { isPhoneNumberSupported } from '@/utils/server/sms/utils'
import { prettyStringify } from '@/utils/shared/prettyLog'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME = 'app/user.communication/bulk.sms'
export const BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_FUNCTION_ID = 'user-communication.bulk-sms'

export interface BulkSmsCommunicationJourneyInngestEventSchema {
  name: typeof BULK_SMS_COMMUNICATION_JOURNEY_INNGEST_EVENT_NAME
  data: BulkSMSPayload
}

export interface BulkSMSPayload {
  messages: Array<{
    smsBody: string
    userWhereInput?: GetPhoneNumberOptions['userWhereInput']
    includePendingDoubleOptIn?: boolean
    campaignName: string
    media?: string[]
  }>
  // default to ET: -4
  timezone?: number
  send?: boolean
  // Number of milliseconds or Time string compatible with the ms package, e.g. "30m", "3 hours", or "2.5d"
  sleepTime?: string | number
  // This is used to take into account the current queue size when queuing new messages
  currentSegmentsInQueue?: number
}

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

// This constants are specific to our twilio phone number type
const MESSAGE_SEGMENTS_PER_SECOND = Number(
  requiredEnv(process.env.MESSAGE_SEGMENTS_PER_SECOND, 'MESSAGE_SEGMENTS_PER_SECOND'),
)
const MAX_QUEUE_LENGTH = Number(requiredEnv(process.env.MAX_QUEUE_LENGTH, 'MAX_QUEUE_LENGTH'))

const MIN_ENQUEUE_HOUR = 11 // 11 am
const MAX_ENQUEUE_HOUR = 22 // 10 pm

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
    const { send, sleepTime, messages, timezone = -4, currentSegmentsInQueue = 0 } = event.data

    if (!messages) {
      throw new NonRetriableError('Missing messages to send')
    }

    messages.forEach(({ smsBody, campaignName }, index) => {
      if (!smsBody) {
        throw new NonRetriableError(`Missing sms body in message ${index}`)
      }

      if (!campaignName) {
        throw new NonRetriableError(`Missing campaign name in message ${index}`)
      }
    })

    // SMS messages over 160 characters are split into 153-character segments due to data headers.
    const getWaitingTimeInSeconds = (totalSegments: number) =>
      totalSegments / MESSAGE_SEGMENTS_PER_SECOND

    const enqueueMessagesPayloadChunks: EnqueueMessagePayload[][] = []
    let totalSegmentsCount = 0
    let totalMessagesCount = 0
    let totalTime = 0
    const messagesInfo: Record<string, object> = {}

    for (const message of messages) {
      const { campaignName, smsBody, includePendingDoubleOptIn, media, userWhereInput } = message

      logger.info(prettyStringify(message))

      let messagesPayload: EnqueueMessagePayload[] = []
      let segmentsCount = 0
      let messagesCount = 0
      let timeToSendSegments = 0

      for (const hasWelcomeMessage of [true, false]) {
        logger.info(`Merging params`)

        const customWhere = mergeWhereParams(
          { ...userWhereInput },
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

        const allPhoneNumbers: string[] = []
        let hasNumbersLeft = true
        let skip = 0

        logger.info(
          'Fetching phone numbers',
          prettyStringify({
            hasWelcomeMessage,
            campaignName,
            smsBody,
          }),
        )

        let index = 0
        while (hasNumbersLeft) {
          const phoneNumberList = await step.run(
            `fetching-phone-numbers-welcome-${String(hasWelcomeMessage)}-${index}`,
            () =>
              getPhoneNumberList({
                campaignName,
                includePendingDoubleOptIn,
                skip,
                userWhereInput: customWhere,
              }),
          )

          skip += phoneNumberList.length
          index += 1

          allPhoneNumbers.push(
            ...phoneNumberList.map(({ phoneNumber }) => phoneNumber).filter(isPhoneNumberSupported),
          )

          logger.info(`phoneNumberList.length ${phoneNumberList.length}. Next skipping ${skip}`)

          if (!DATABASE_QUERY_LIMIT || phoneNumberList.length < DATABASE_QUERY_LIMIT) {
            hasNumbersLeft = false
          }
        }

        logger.info('Got phone numbers, adding to messagesPayload')

        const body = hasWelcomeMessage ? addWelcomeMessage(smsBody) : smsBody

        // Using uniq outside the while loop, because getPhoneNumberList could return the same phone number in two separate batches
        const payload = uniq(allPhoneNumbers).map(phoneNumber => ({
          phoneNumber,
          messages: [
            ...(hasWelcomeMessage
              ? [{ journeyType: UserCommunicationJourneyType.WELCOME_SMS }]
              : []),
            {
              // Here we're adding the welcome legalese to the bulk text, when doing this we need to add an empty message with
              // WELCOME_SMS as journey type so that enqueueSMS register in our DB that the user received the welcome legalese
              body,
              campaignName,
              journeyType: UserCommunicationJourneyType.BULK_SMS,
              media,
            },
          ],
        }))

        // We need to use concat here because using spread is exceeding maximum call stack size
        messagesPayload = messagesPayload.concat(payload)

        logger.info(`messagesPayload.length ${messagesPayload.length}`)

        logger.info(`Counting segments`)

        const payloadCounts = await step.run(
          `count-messages-and-segments-welcome-${String(hasWelcomeMessage)}`,
          () => countMessagesAndSegments(payload),
        )

        segmentsCount += payloadCounts.segments
        messagesCount += payloadCounts.messages
        timeToSendSegments += getWaitingTimeInSeconds(payloadCounts.segments)

        logger.info(
          prettyStringify({
            segmentsCount,
            messagesCount,
            timeToSendSegments: getWaitingTimeInSeconds(payloadCounts.segments),
          }),
        )
      }

      const payloadChunks = chunk(messagesPayload, TWILIO_RATE_LIMIT)

      // This is for debugging and estimation purposes only
      // Grouping bulk send count by campaign name
      update(
        messagesInfo,
        [campaignName],
        (
          existingPayload = {
            segmentsCount: 0,
            messagesCount: 0,
            totalTime: 0,
            chunks: 0,
          },
        ) => ({
          segmentsCount: segmentsCount + existingPayload.segmentsCount,
          messagesCount: messagesCount + existingPayload.messagesCount,
          totalTime: timeToSendSegments + existingPayload.totalTime,
          chunks: payloadChunks.length + existingPayload.chunks,
        }),
      )

      enqueueMessagesPayloadChunks.push(...payloadChunks)

      totalSegmentsCount += segmentsCount
      totalMessagesCount += messagesCount
      totalTime += timeToSendSegments
    }

    const bulkInfo = {
      messagesInfo,
      total: {
        segmentsCount: totalSegmentsCount,
        messagesCount: totalMessagesCount,
        totalTime: formatTime(totalTime),
        chunks: enqueueMessagesPayloadChunks.length,
      },
    }

    if (!send) {
      return bulkInfo
    } else {
      logger.info('initial-info', prettyStringify(bulkInfo))
    }

    if (NEXT_PUBLIC_ENVIRONMENT !== 'production' && totalMessagesCount > 100) {
      throw new NonRetriableError(
        'Cannot send more then 100 messages in a non-production environment',
      )
    }

    if (sleepTime) {
      logger.info('scheduled-sleep', sleepTime)
      await step.sleep('scheduled-sleep', sleepTime)
    }

    let totalQueuedMessages = 0
    let totalQueuedSegments = 0
    let totalTimeToSendMessagesInSeconds = 0

    let segmentsInQueue = currentSegmentsInQueue ?? 0
    let timeInSecondsToEmptyQueue = getWaitingTimeInSeconds(segmentsInQueue)

    for (let i = 0; i < enqueueMessagesPayloadChunks.length; i += 1) {
      const now = addHours(new Date(), timezone)
      const minEnqueueHourToday = addHours(startOfDay(now), MIN_ENQUEUE_HOUR)
      const maxEnqueueHourToday = addHours(startOfDay(now), MAX_ENQUEUE_HOUR)

      if (now < minEnqueueHourToday) {
        const waitingTime = differenceInMilliseconds(minEnqueueHourToday, now)
        logger.info(
          `now (${now.toString()}) it's earlier than minEnqueueHourToday (${minEnqueueHourToday.toString()})`,
          `Sleep for: ${formatTime(waitingTime / 1000)}`,
        )
        await step.sleep('wait-until-min-enqueue-hour', waitingTime)
      }

      if (now > maxEnqueueHourToday) {
        const waitingTime = differenceInMilliseconds(addDays(minEnqueueHourToday, 1), now)
        logger.info(
          `now (${now.toString()}) it's later than maxEnqueueHourToday (${maxEnqueueHourToday.toString()})`,
          `Sleep for: ${formatTime(waitingTime / 1000)}`,
        )
        await step.sleep('wait-until-min-enqueue-hour-of-next-day', waitingTime)
      }

      const payloadChunk = enqueueMessagesPayloadChunks[i]

      const { queuedMessages, segmentsSent } = await step.invoke(`enqueue-messages-${i + 1}`, {
        function: enqueueSMS,
        data: {
          payload: payloadChunk,
        },
      })

      totalQueuedMessages += queuedMessages
      totalQueuedSegments += segmentsSent

      segmentsInQueue += segmentsSent
      const timeToSendSegments = getWaitingTimeInSeconds(segmentsSent)

      timeInSecondsToEmptyQueue += timeToSendSegments
      totalTimeToSendMessagesInSeconds += timeToSendSegments

      const emptyQueueTime = addSeconds(now, timeInSecondsToEmptyQueue)

      if (emptyQueueTime > maxEnqueueHourToday) {
        const waitingTime = differenceInMilliseconds(
          emptyQueueTime > addDays(minEnqueueHourToday, 1)
            ? emptyQueueTime
            : addDays(minEnqueueHourToday, 1),
          now,
        )
        logger.info(
          `queue will be empty at ${emptyQueueTime.toString()}`,
          `Sleep for: ${formatTime(waitingTime / 1000)}`,
        )
        await step.sleep('wait-until-min-enqueue-hour-of-next-day', waitingTime)

        segmentsInQueue = 0
        timeInSecondsToEmptyQueue = 0
      }

      if (totalSegmentsCount >= MAX_QUEUE_LENGTH) {
        const nextPayloadChunk = enqueueMessagesPayloadChunks[i + 1]

        if (nextPayloadChunk) {
          const { segments: nextPayloadSegments } = countMessagesAndSegments(nextPayloadChunk)

          if (segmentsInQueue + nextPayloadSegments >= MAX_QUEUE_LENGTH) {
            logger.info(
              'queue-overflow-control',
              prettyStringify({
                segmentsInQueue,
                timeToEmptyQueue: formatTime(timeInSecondsToEmptyQueue),
              }),
            )

            await step.sleep(
              `waiting-${formatTime(timeInSecondsToEmptyQueue).replace(' ', '-')}-for-queue-to-be-empty`,
              timeInSecondsToEmptyQueue,
            )

            segmentsInQueue = 0
            timeInSecondsToEmptyQueue = 0
          }
        }
      }

      logger.info(
        `shipping-estimate`,
        prettyStringify({
          messages: bulkInfo.total.messagesCount - totalQueuedMessages,
          time: formatTime(totalTime - totalTimeToSendMessagesInSeconds),
        }),
      )

      logger.info(
        `summary-info - ${i + 1}/${enqueueMessagesPayloadChunks.length}`,
        prettyStringify({
          timeInSecondsToEmptyQueue: formatTime(timeInSecondsToEmptyQueue),
          segmentsInQueue,
          totalQueuedMessages,
          totalQueuedSegments,
        }),
      )
    }

    logger.info('Finished')

    return {
      totalQueuedMessages,
      totalQueuedSegments,
    }
  },
)

function formatTime(seconds: number) {
  if (seconds < SECONDS_DURATION.MINUTE) {
    return `${seconds.toPrecision(2)} seconds`
  } else if (seconds < SECONDS_DURATION.HOUR) {
    const minutes = Math.ceil(seconds / SECONDS_DURATION.MINUTE)
    return `${minutes} minutes`
  } else {
    const hours = Math.ceil(seconds / SECONDS_DURATION.HOUR)
    return `${hours} hours`
  }
}

// Doing this so lodash merge is typed
const mergeWhereParams = merge<Prisma.UserGroupByArgs['where'], Prisma.UserGroupByArgs['where']>

// Add a space before the welcome message to ensure proper formatting. If the message ends with a link,
// appending the welcome message directly could break the link.
const addWelcomeMessage = (message: string) => message + ` \n\n${BULK_WELCOME_MESSAGE}`

export interface GetPhoneNumberOptions {
  includePendingDoubleOptIn?: boolean
  skip: number
  userWhereInput?: Prisma.UserGroupByArgs['where']
  campaignName?: string
}

async function getPhoneNumberList(options: GetPhoneNumberOptions) {
  return prismaClient.user.groupBy({
    by: ['phoneNumber'],
    where: {
      ...mergeWhereParams(
        { ...options.userWhereInput },
        {
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
    skip: options.skip,
    take: DATABASE_QUERY_LIMIT,
    orderBy: { phoneNumber: 'asc' },
  })
}
