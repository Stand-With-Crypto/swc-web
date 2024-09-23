import { uniq } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { validatePhoneNumber } from '@/utils/shared/phoneNumber'

import { flagInvalidPhoneNumbers } from './utils'

const BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_FUNCTION_ID =
  'script.backfill-phone-number-validation'
const BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME =
  'script.backfill-phone-number-validation'

export type BackfillPhoneNumberValidationInngestEventSchema = {
  name: typeof BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME
  data: {
    persist?: boolean
  }
}

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

export const backfillPhoneNumberValidation = inngest.createFunction(
  {
    id: BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
  },
  {
    event: BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME,
  },
  async ({ step, event }) => {
    const { persist } = event.data

    let allPhoneNumbers: string[] = []
    let cursor: Date | undefined
    let hasNumbersLeft = true

    while (hasNumbersLeft) {
      const phoneNumbers = await prismaClient.user.groupBy({
        by: ['phoneNumber', 'datetimeCreated'],
        where: {
          datetimeCreated: {
            gte: cursor,
          },
          // By default phones are considered valid because they passed the basic validation
          hasValidPhoneNumber: true,
        },
        take: DATABASE_QUERY_LIMIT,
        orderBy: [{ datetimeCreated: 'asc' }, { phoneNumber: 'asc' }],
      })

      cursor = phoneNumbers.at(-1)?.datetimeCreated
      allPhoneNumbers = allPhoneNumbers.concat(phoneNumbers.map(({ phoneNumber }) => phoneNumber))

      if (!DATABASE_QUERY_LIMIT || phoneNumbers.length < DATABASE_QUERY_LIMIT) {
        hasNumbersLeft = false
      }
    }

    // Using uniq here to not send multiple messages to the same phone number
    const uniquePhoneNumbers = uniq(allPhoneNumbers)

    const invalidPhoneNumbers = uniquePhoneNumbers.filter(
      phoneNumber => !validatePhoneNumber(phoneNumber),
    )

    if (persist) {
      await step.run('flag-invalid-phone-numbers', () =>
        flagInvalidPhoneNumbers(invalidPhoneNumbers),
      )
    }

    return `Found ${invalidPhoneNumbers.length} invalid phone numbers`
  },
)
