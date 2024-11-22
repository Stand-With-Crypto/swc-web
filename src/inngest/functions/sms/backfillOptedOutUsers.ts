import { SMSStatus } from '@prisma/client'

import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { messagingClient } from '@/utils/server/sms'
import { identifyIncomingKeyword } from '@/utils/server/sms/identifyIncomingKeyword'

const BACKFILL_OPTED_OUT_USERS_FUNCTION_ID = 'script.backfill-sms-opted-out-users'
const BACKFILL_OPTED_OUT_USERS_EVENT_NAME = 'script/backfill.sms.opted.out.users'

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const YEAR = 2024

export interface BackfillOptedOutUsersSchema {
  name: typeof BACKFILL_OPTED_OUT_USERS_EVENT_NAME
  data: {
    persist: boolean
    startingMonth?: number
    startingDay?: number
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
    const { persist, startingMonth, startingDay } = event.data

    let optedOutUsers = 0

    for (let month = startingMonth ?? 1; month <= 12; month += 1) {
      for (let day = month === (startingMonth ?? 1) ? (startingDay ?? 1) : 1; day <= 31; day += 1) {
        const dateString = `${YEAR}-${month}-${day}`
        const date = new Date(YEAR, month - 1, day)

        if (Number.isNaN(date.getDay())) {
          continue
        }

        logger.info(`Fetching ${dateString}`)

        const optedOutPhoneNumbers = await step.run(`fetch-opted-out-users-${dateString}`, () =>
          getOptedOutPhoneNumbers(date),
        )

        logger.info(`Opted out phone numbers: ${optedOutPhoneNumbers.length}`)

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
        } else {
          optedOutUsers += optedOutPhoneNumbers.length
        }
      }
    }

    return `Opted out ${optedOutUsers} users`
  },
)

const invalidStopMessages = [
  'STOP ',
  ' STOP',
  'STOP\n',
  ' STOP ',
  `Stop
  `,
  `Stop 
  `,
] as const

async function getOptedOutPhoneNumbers(date: Date) {
  const phoneNumbers = new Set<string>()

  if (!TWILIO_PHONE_NUMBER) return []

  console.log('Fetching...', date)

  const messages = await messagingClient.messages.list({
    dateSent: date,
    to: TWILIO_PHONE_NUMBER,
  })

  console.log('Filtering...', messages.length)

  for (const message of messages) {
    const body = message.body.toUpperCase()

    if (invalidStopMessages.includes(body)) {
      phoneNumbers.add(message.from)
    }
    if (identifyIncomingKeyword(body)?.isUnstopKeyword) {
      phoneNumbers.delete(message.from)
    }
  }

  return Array.from(phoneNumbers)
}
