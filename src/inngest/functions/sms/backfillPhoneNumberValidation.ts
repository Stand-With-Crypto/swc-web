import { Prisma } from '@prisma/client'
import { parseISO } from 'date-fns'

import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

import { fetchPhoneNumbers, flagInvalidPhoneNumbers, validatePhoneNumbers } from './utils'

const logger = getLogger('backfill-phone-validation')

const BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_FUNCTION_ID =
  'script.backfill-phone-number-validation'
const BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME =
  'script.backfill-phone-number-validation'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = Number(process.env.DATABASE_QUERY_LIMIT) || undefined

interface BackfillPhoneNumberValidationPayload {
  persist?: boolean
}

export const backfillPhoneNumberValidation = inngest.createFunction(
  {
    id: BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_FUNCTION_ID,
    retries: MAX_RETRY_COUNT,
  },
  {
    event: BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME,
  },
  async ({ step, event }) => {
    const { persist } = event.data as BackfillPhoneNumberValidationPayload

    let hasNumbersLest = true
    let outerCursor: Date | undefined
    let iterations = 0
    let phoneNumbersValidated = 0
    let totalInvalidPhoneNumbers = 0
    while (hasNumbersLest) {
      logger.info(`Iteration ${iterations}`)
      logger.info(`Fetching...`)
      // Fetches all phone numbers within the database query limit range
      const [phoneNumberChunks, newCursor, length] = await step.run('fetching-phone-numbers', () =>
        fetchPhoneNumbers(
          (take, cursor = outerCursor) =>
            getPhoneNumberList({
              take,
              where: {
                datetimeCreated: {
                  gt: cursor,
                },
              },
            }),
          {
            // fetchPhoneNumbers wont exceed the query limit if we pass it as max length
            maxLength: DATABASE_QUERY_LIMIT,
          },
        ),
      )

      outerCursor = parseISO(newCursor)
      phoneNumbersValidated += length

      logger.info(`Validating...`)

      const invalidPhoneNumbers = await step.run('validating-phone-numbers', async () => {
        let allInvalidPhoneNumbers: string[] = []

        for (const phoneNumberBatch of phoneNumberChunks) {
          const { invalid } = await validatePhoneNumbers(phoneNumberBatch)

          allInvalidPhoneNumbers = allInvalidPhoneNumbers.concat(invalid)
        }

        return allInvalidPhoneNumbers
      })

      logger.info(`Found ${invalidPhoneNumbers.length} invalid phone numbers`)

      totalInvalidPhoneNumbers += invalidPhoneNumbers.length

      if (persist && invalidPhoneNumbers.length > 0) {
        logger.info('Persisting...')

        await step.run('updating-invalid-phone-numbers', () =>
          flagInvalidPhoneNumbers(invalidPhoneNumbers),
        )
      }

      logger.info(`Finished iteration ${iterations}`)

      if ((DATABASE_QUERY_LIMIT && length < DATABASE_QUERY_LIMIT) || !DATABASE_QUERY_LIMIT) {
        hasNumbersLest = false
      }

      iterations += 1
    }

    return {
      iterations,
      phoneNumbersValidated,
      totalInvalidPhoneNumbers,
    }
  },
)

async function getPhoneNumberList(args?: Omit<Prisma.UserGroupByArgs, 'by' | 'orderBy'>) {
  return prismaClient.user.groupBy({
    ...args,
    by: ['phoneNumber', 'datetimeCreated'],
    where: {
      ...args?.where,
      // By default phones are considered valid because they passed the basic validation
      hasValidPhoneNumber: true,
      phoneNumber: {
        not: '',
      },
    },
    orderBy: [{ datetimeCreated: 'asc' }, { phoneNumber: 'asc' }],
  })
}
