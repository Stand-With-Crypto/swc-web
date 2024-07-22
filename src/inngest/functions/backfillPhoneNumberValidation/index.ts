import { Prisma } from '@prisma/client'
import { parseISO } from 'date-fns'
import { chunk } from 'lodash-es'

import { fetchPhoneNumbers } from '@/inngest/functions/sms/utils/fetchPhoneNumbers'
import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import { TWILIO_RATE_LIMIT, twilioPhoneNumberValidation } from '@/utils/server/sms'
import { getLogger } from '@/utils/shared/logger'
import { validatePhoneNumber as basicPhoneNumberValidation } from '@/utils/shared/phoneNumber'
import { sleep } from '@/utils/shared/sleep'

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

      const invalidPhoneNumberChunks = await step.run('validating-phone-numbers', async () => {
        let phoneNumbersThatStillNeedValidation: string[] = []
        let allInvalidPhoneNumbers: string[] = []

        // First we will validate with libphonenumber to reduce the usage of twilio's api since it has a rate limit
        for (const phoneNumberBatch of phoneNumberChunks) {
          const { invalid, valid } = await validatePhoneNumbers(
            phoneNumberBatch,
            basicPhoneNumberValidation,
          )

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

        logger.info(`Found ${allInvalidPhoneNumbers.length} invalid phone numbers`)

        // Split invalid numbers into chunks, because there could be more than one user with the same phone number
        return DATABASE_QUERY_LIMIT
          ? chunk(allInvalidPhoneNumbers, DATABASE_QUERY_LIMIT / 3)
          : [allInvalidPhoneNumbers]
      })

      if (
        persist &&
        invalidPhoneNumberChunks.length > 0 &&
        invalidPhoneNumberChunks[0].length > 0
      ) {
        logger.info('Persisting...')

        await step.run('updating-invalid-phone-numbers', async () => {
          for (const invalidPhoneNumberBatch of invalidPhoneNumberChunks) {
            const updateInvalidPhoneNumbersBatch = invalidPhoneNumberBatch.map(phoneNumber => {
              return prismaClient.user.updateMany({
                data: {
                  hasValidPhoneNumber: false,
                },
                where: {
                  phoneNumber,
                },
              })
            })

            await Promise.all(updateInvalidPhoneNumbersBatch)
          }
        })
      }

      logger.info(`Finished iteration ${iteration}`)

      if ((DATABASE_QUERY_LIMIT && length < DATABASE_QUERY_LIMIT) || !DATABASE_QUERY_LIMIT) {
        hasNumbersLest = false
      }

      iteration += 1
    }
  },
)

const VALIDATION_MAX_RETRIES = 3

type PhoneNumberValidationFunction = (phoneNumber: string) => Promise<boolean> | boolean

async function validatePhoneNumbers(
  phoneNumbers: string[],
  validation: PhoneNumberValidationFunction,
) {
  const validateBatch = (batch: string[]) => {
    const validatePhoneNumbersPromises = batch.map(async phoneNumber => {
      try {
        const isValid = await validation(phoneNumber)

        return {
          phoneNumber,
          isValid,
        }
      } catch (error) {
        return {
          phoneNumber,
          isValid: null,
        }
      }
    })

    return Promise.all(validatePhoneNumbersPromises)
  }

  let unidentifiedPhoneNumbers: string[] = []
  const invalidPhoneNumbers: string[] = []
  const validPhoneNumbers: string[] = []

  // Validate phone number with exponential retries duo to twilio's rate limit
  for (let i = 0; i < VALIDATION_MAX_RETRIES; i += 1) {
    // At first, all phone numbers are unidentified
    const validatedPhoneNumbers = await validateBatch(
      i === 0 ? phoneNumbers : unidentifiedPhoneNumbers,
    )
    unidentifiedPhoneNumbers = []

    validatedPhoneNumbers.forEach(({ isValid, phoneNumber }) => {
      if (isValid) {
        validPhoneNumbers.push(phoneNumber)
      } else if (isValid === false) {
        invalidPhoneNumbers.push(phoneNumber)
      } else {
        unidentifiedPhoneNumbers.push(phoneNumber)
      }
    })

    if (unidentifiedPhoneNumbers.length > 0) {
      await sleep(10000 * i + 1)
    } else {
      break
    }
  }

  return {
    invalid: invalidPhoneNumbers,
    valid: validPhoneNumbers,
    unidentified: unidentifiedPhoneNumbers,
  }
}

async function getPhoneNumberList(args?: Omit<Prisma.UserGroupByArgs, 'by' | 'orderBy'>) {
  return prismaClient.user.groupBy({
    ...args,
    by: ['phoneNumber', 'datetimeCreated'],
    where: {
      ...args?.where,
      phoneNumber: {
        not: '',
      },
    },
    orderBy: [{ datetimeCreated: 'asc' }, { phoneNumber: 'asc' }],
  })
}
