import { Prisma } from '@prisma/client'
import { parseISO } from 'date-fns'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { TWILIO_RATE_LIMIT, twilioPhoneNumberValidation } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'

import { fetchPhoneNumbers, flagInvalidPhoneNumbers, validatePhoneNumbers } from './utils'

const logger = getLogger('backfill-phone-validation')

const BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_FUNCTION_ID =
  'script.backfill-phone-number-validation'
const BACKFILL_PHONE_NUMBER_VALIDATION_INNGEST_EVENT_NAME =
  'script.backfill-phone-number-validation'

const MAX_RETRY_COUNT = 0
const DATABASE_QUERY_LIMIT = process.env.DATABASE_QUERY_LIMIT
  ? Number(process.env.DATABASE_QUERY_LIMIT)
  : undefined

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
    let iteration = 0
    while (hasNumbersLest) {
      logger.info(`Iteration ${iteration}`)
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
            maxLength: DATABASE_QUERY_LIMIT,
          },
        ),
      )

      outerCursor = parseISO(newCursor)

      logger.info(`Validating...`)

      const invalidPhoneNumbers = await step.run('validating-phone-numbers', async () => {
        let phoneNumbersThatStillNeedValidation: string[] = []
        let allInvalidPhoneNumbers: string[] = []

        // First we will validate with libphonenumber to reduce the usage of twilio's api since it has a rate limit
        for (const phoneNumberBatch of phoneNumberChunks) {
          const { invalid, valid } = await validatePhoneNumbers(phoneNumberBatch)

          allInvalidPhoneNumbers = allInvalidPhoneNumbers.concat(invalid)
          phoneNumbersThatStillNeedValidation = phoneNumbersThatStillNeedValidation.concat(valid)
        }

        // We also need to split phone numbers into batches because of the rate limit
        for (const phoneNumberBatch of chunk(
          phoneNumbersThatStillNeedValidation,
          TWILIO_RATE_LIMIT,
        )) {
          const { invalid } = await validatePhoneNumbers(
            phoneNumberBatch,
            twilioPhoneNumberValidation,
          )

          allInvalidPhoneNumbers = allInvalidPhoneNumbers.concat(invalid)
        }

        return allInvalidPhoneNumbers
      })

      logger.info(`Found ${invalidPhoneNumbers.length} invalid phone numbers`)

      if (persist && invalidPhoneNumbers.length > 0) {
        logger.info('Persisting...')

        await step.run('updating-invalid-phone-numbers', () =>
          flagInvalidPhoneNumbers(invalidPhoneNumbers),
        )
      }

      logger.info(`Finished iteration ${iteration}`)

      if ((DATABASE_QUERY_LIMIT && length < DATABASE_QUERY_LIMIT) || !DATABASE_QUERY_LIMIT) {
        hasNumbersLest = false
      }

      iteration += 1
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
