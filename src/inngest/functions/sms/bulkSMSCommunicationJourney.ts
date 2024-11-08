import {
  CommunicationMessageStatus,
  Prisma,
  SMSStatus,
  UserCommunicationJourneyType,
} from '@prisma/client'
import { addDays, addHours, differenceInMilliseconds, startOfDay } from 'date-fns'
import { NonRetriableError } from 'inngest'
import { chunk, merge, uniq, uniqBy, update } from 'lodash-es'

import { EnqueueMessagePayload, enqueueSMS } from '@/inngest/functions/sms/enqueueMessages'
import { countMessagesAndSegments } from '@/inngest/functions/sms/utils/countMessagesAndSegments'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { TWILIO_RATE_LIMIT } from '@/utils/server/sms'
import { BULK_WELCOME_MESSAGE } from '@/utils/server/sms/messages'
import { isPhoneNumberSupported } from '@/utils/server/sms/utils'
import { prettyStringify } from '@/utils/shared/prettyLog'
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
  // default to ET: -5
  timezone?: number
  send?: boolean
  // Number of milliseconds or Time string compatible with the ms package, e.g. "30m", "3 hours", or "2.5d"
  sleepTime?: string | number
}

const MAX_RETRY_COUNT = 1
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

const MIN_ENQUEUE_HOUR = 9 // 9 am
const MAX_ENQUEUE_HOUR = 22 // 10 pm

// Before this date we were sending messages with a toll-free number, now that we're changing to a short-code number we need to send the legal text again in the first message
const SHORT_CODE_GO_LIVE_DATE = new Date('2024-10-03 12:00:00.000')

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
    const { send, sleepTime, messages, timezone = -5 } = event.data

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

    if (sleepTime) {
      logger.info('scheduled-sleep', sleepTime)
      await step.sleep('scheduled-sleep', sleepTime)
    }

    const enqueueMessagesPayloadChunks: EnqueueMessagePayload[][] = []
    let totalSegmentsCount = 0
    let totalMessagesCount = 0
    const messagesInfo: Record<string, object> = {}

    for (const message of messages) {
      const { campaignName, smsBody, includePendingDoubleOptIn, media, userWhereInput } = message

      logger.info(prettyStringify(message))

      let messagesPayload: EnqueueMessagePayload[] = []

      // We need to keep this order as true -> false because later we use groupBy, which keeps the first occurrence of each element. In this case, that would be the user who already received the welcome message, so we don’t need to send the legal disclaimer again.
      // This happens because of how where works with groupBy, and there are cases where different users with the same phone number show up in both groups. So, in those cases, we don’t want to send two messages—just one.
      for (const userHasWelcomeMessage of [true, false]) {
        const customWhere = mergeWhereParams(
          { ...userWhereInput },
          {
            UserCommunicationJourney: userHasWelcomeMessage
              ? {
                  some: {
                    journeyType: UserCommunicationJourneyType.WELCOME_SMS,
                    userCommunications: {
                      some: {
                        status: CommunicationMessageStatus.DELIVERED,
                      },
                    },
                    datetimeCreated: {
                      gt: SHORT_CODE_GO_LIVE_DATE,
                    },
                  },
                }
              : {
                  every: {
                    OR: [
                      {
                        journeyType: {
                          not: UserCommunicationJourneyType.WELCOME_SMS,
                        },
                      },
                      {
                        journeyType: UserCommunicationJourneyType.WELCOME_SMS,
                        datetimeCreated: {
                          lt: SHORT_CODE_GO_LIVE_DATE,
                        },
                      },
                      {
                        journeyType: UserCommunicationJourneyType.WELCOME_SMS,
                        userCommunications: {
                          every: {
                            status: {
                              not: CommunicationMessageStatus.DELIVERED,
                            },
                          },
                        },
                      },
                    ],
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
            userHasWelcomeMessage,
            campaignName,
            smsBody,
          }),
        )

        let index = 0
        while (hasNumbersLeft) {
          const phoneNumberList = await step.run(
            `fetching-phone-numbers-welcome-${String(userHasWelcomeMessage)}-${index}`,
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

          allPhoneNumbers.push(...phoneNumberList.filter(isPhoneNumberSupported))

          logger.info(`phoneNumberList.length ${phoneNumberList.length}. Next skipping ${skip}`)

          if (!DATABASE_QUERY_LIMIT || phoneNumberList.length < DATABASE_QUERY_LIMIT) {
            hasNumbersLeft = false
          }
        }

        logger.info('Got phone numbers, adding to messagesPayload')

        // Here we're adding the welcome legalese to the bulk text, when doing this we need to register in our DB that the user received the welcome legalese
        const body = !userHasWelcomeMessage ? addWelcomeMessage(smsBody) : smsBody

        // Using uniq outside the while loop, because getPhoneNumberList could return the same phone number in two separate batches
        // We need to use concat here because using spread is exceeding maximum call stack size
        messagesPayload = messagesPayload.concat(
          uniq(allPhoneNumbers).map(phoneNumber => ({
            phoneNumber,
            messages: [
              {
                body,
                campaignName,
                journeyType: UserCommunicationJourneyType.BULK_SMS,
                media,
                // If the user does not have a welcome message, the body must have it
                hasWelcomeMessageInBody: !userHasWelcomeMessage,
              },
            ],
          })),
        )

        logger.info(`messagesPayload.length ${messagesPayload.length}`)
      }

      // Using uniqBy here because different users with the same phone number can show up in both groups when hasWelcomeMessage is either true or false. This happens because where runs before groupBy
      messagesPayload = uniqBy(messagesPayload, 'phoneNumber')

      logger.info(`Counting segments`)

      const payloadCounts = await step.run(`count-messages-and-segments`, () =>
        countMessagesAndSegments(messagesPayload),
      )

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
            chunks: 0,
          },
        ) => ({
          segmentsCount: payloadCounts.segments + existingPayload.segmentsCount,
          messagesCount: payloadCounts.messages + existingPayload.messagesCount,
          chunks: payloadChunks.length + existingPayload.chunks,
        }),
      )

      enqueueMessagesPayloadChunks.push(...payloadChunks)

      totalSegmentsCount += payloadCounts.segments
      totalMessagesCount += payloadCounts.messages
    }

    const bulkInfo = {
      messagesInfo,
      total: {
        segmentsCount: totalSegmentsCount,
        messagesCount: totalMessagesCount,
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

    let totalQueuedMessages = 0
    let totalQueuedSegments = 0

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

      const { queuedMessages, segmentsSent } = await step.invoke(
        `enqueue-messages-${i + 1}/${enqueueMessagesPayloadChunks.length}`,
        {
          function: enqueueSMS,
          data: {
            payload: payloadChunk,
          },
        },
      )

      totalQueuedMessages += queuedMessages
      totalQueuedSegments += segmentsSent

      logger.info(
        `Shipping estimate: ${i + 1}/${enqueueMessagesPayloadChunks.length}`,
        prettyStringify({
          chunksLeft: enqueueMessagesPayloadChunks.length - (i + 1),
          messagesLeft: bulkInfo.total.messagesCount - totalQueuedMessages,
        }),
      )

      logger.info(
        `Summary info: ${i + 1}/${enqueueMessagesPayloadChunks.length}`,
        prettyStringify({
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
  return prismaClient.user
    .groupBy({
      by: ['phoneNumber'],
      where: {
        ...mergeWhereParams(
          { ...options.userWhereInput },
          {
            UserCommunicationJourney: {
              every: {
                OR: [
                  {
                    campaignName: {
                      not: options.campaignName,
                    },
                  },
                  {
                    campaignName: options.campaignName,
                    userCommunications: {
                      every: {
                        status: {
                          not: CommunicationMessageStatus.DELIVERED,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ),
        hasValidPhoneNumber: true,
        smsStatus: {
          in: [
            SMSStatus.OPTED_IN,
            SMSStatus.OPTED_IN_HAS_REPLIED,
            ...(options.includePendingDoubleOptIn
              ? [SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN]
              : []),
          ],
        },
      },
      skip: options.skip,
      take: DATABASE_QUERY_LIMIT,
      orderBy: { phoneNumber: 'asc' },
    })
    .then(res => res.map(({ phoneNumber }) => phoneNumber))
}
