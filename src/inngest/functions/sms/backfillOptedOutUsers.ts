import { SMSStatus } from '@prisma/client'
import { addDays, format, isBefore, isEqual, parseISO, startOfDay } from 'date-fns'
import { NonRetriableError } from 'inngest'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { messagingClient, TWILIO_LIST_MESSAGES_QUERY_LIMIT } from '@/utils/server/sms'
import { identifyIncomingKeyword } from '@/utils/server/sms/identifyIncomingKeyword'
import { Logger } from '@/utils/shared/logger'

const BACKFILL_OPTED_OUT_USERS_FUNCTION_ID = 'script.backfill-sms-opted-out-users'
const BACKFILL_OPTED_OUT_USERS_EVENT_NAME = 'script/backfill.sms.opted.out.users'

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const TWILIO_GO_LIVE_DATE = parseISO('2024-08-01')

export interface BackfillOptedOutUsersSchema {
  name: typeof BACKFILL_OPTED_OUT_USERS_EVENT_NAME
  data: {
    persist: boolean
    startingDate?: string
  }
}

export const backfillOptedOutUsers = inngest.createFunction(
  {
    id: BACKFILL_OPTED_OUT_USERS_FUNCTION_ID,
    retries: 0,
  },
  {
    event: BACKFILL_OPTED_OUT_USERS_EVENT_NAME,
  },
  async ({ step, logger, event }) => {
    const { persist, startingDate } = event.data

    let optedOutUsers = 0

    const today = startOfDay(new Date())
    let queryDate = startingDate ? parseISO(startingDate) : TWILIO_GO_LIVE_DATE

    let optedOutPhoneNumbers: string[] = []

    while (isBefore(queryDate, today)) {
      // This step takes more than 3 minutes to fetch all messages for 2024-11-01,
      // so we need to split it into two time ranges to avoid timeouts.
      if (isEqual(queryDate, parseISO('2024-11-01'))) {
        for (const time of [
          { start: '00:00:00', end: '18:00:00' },
          { start: '18:00:00', end: '23:59:59' },
        ]) {
          const phoneNumbers = await step.run(
            `fetch-opted-out-users-${format(queryDate, 'yyyy-MM-dd')}-${time.start}-${time.end}`,
            () =>
              getOptedOutPhoneNumbers({
                dateSentAfter: new Date(`${format(queryDate, 'yyyy-MM-dd')}T${time.start}`),
                dateSentBefore: new Date(`${format(queryDate, 'yyyy-MM-dd')}T${time.end}`),
                logger,
              }),
          )

          optedOutPhoneNumbers.push(...phoneNumbers)
        }
      } else {
        const phoneNumbers = await step.run(
          `fetch-opted-out-users-${format(queryDate, 'yyyy-MM-dd')}`,
          () => getOptedOutPhoneNumbers({ dateSent: queryDate, logger }),
        )

        optedOutPhoneNumbers.push(...phoneNumbers)
      }

      queryDate = addDays(queryDate, 1)
    }

    const optedBackInPhoneNumbers: string[] = []

    for (const phoneNumberChunk of chunk(optedOutPhoneNumbers, TWILIO_LIST_MESSAGES_QUERY_LIMIT)) {
      const optedBackInPhoneNumbersChunk = await step.run(
        `filter-opted-back-in-users-${phoneNumberChunk.length}`,
        async () => findOptedBackInUsers(phoneNumberChunk, logger),
      )

      optedBackInPhoneNumbers.push(...optedBackInPhoneNumbersChunk)

      await step.sleep('await-twilio-timeout', '30s')
    }

    optedOutPhoneNumbers = optedOutPhoneNumbers.filter(
      phoneNumber => !optedBackInPhoneNumbers.includes(phoneNumber),
    )

    if (optedOutPhoneNumbers.length > 0 && persist) {
      const { count } = await step.run(`opt-out-users`, async () =>
        prismaClient.user.updateMany({
          where: {
            phoneNumber: {
              in: optedOutPhoneNumbers,
            },
          },
          data: {
            smsStatus: SMSStatus.OPTED_OUT,
          },
        }),
      )

      optedOutUsers += count
    }

    return `Opted out ${optedOutUsers} users`
  },
)

type TwilioListMessagesData = Parameters<typeof messagingClient.messages.list>[0]

interface GetOptedOutPhoneNumbersParams extends Omit<TwilioListMessagesData, 'to'> {
  logger: Logger
}

async function getOptedOutPhoneNumbers({ logger, ...params }: GetOptedOutPhoneNumbersParams) {
  const phoneNumbers = new Set<string>()

  if (!TWILIO_PHONE_NUMBER) return []

  logger.info(`Fetching messages`, params)

  const messages = await messagingClient.messages.list({
    to: TWILIO_PHONE_NUMBER,
    ...params,
  })

  logger.info(`Filtering ${messages.length} message`)

  for (const message of messages) {
    const body = message.body.toUpperCase()

    const keyword = identifyIncomingKeyword(body)

    if (keyword?.isOptOutKeyword && keyword.value !== body) {
      phoneNumbers.add(message.from)
    }
  }

  logger.info(`Found ${phoneNumbers.size} invalid opt out messages`)

  return Array.from(phoneNumbers)
}

async function findOptedBackInUsers(phoneNumbers: string[], logger: Logger) {
  if (phoneNumbers.length > TWILIO_LIST_MESSAGES_QUERY_LIMIT) {
    throw new NonRetriableError(
      'findOptedBackInUsers - phoneNumbers.length > TWILIO_LIST_MESSAGES_QUERY_LIMIT',
    )
  }

  const optedBackInPhoneNumbers = new Set<string>()

  await Promise.all(
    phoneNumbers.map(async phoneNumber => {
      const messages = await messagingClient.messages.list({
        from: phoneNumber,
      })

      messages.forEach(({ body }) => {
        const keyword = identifyIncomingKeyword(body)

        if (keyword?.isUnstopKeyword) {
          optedBackInPhoneNumbers.add(phoneNumber)
        } else if (keyword?.isOptOutKeyword) {
          // If the last message of the user was STOP, we don't want to opt them back in
          optedBackInPhoneNumbers.delete(phoneNumber)
        }
      })
    }),
  )

  logger.info(`Found ${optedBackInPhoneNumbers.size} users who opted back in`)

  return Array.from(optedBackInPhoneNumbers)
}
