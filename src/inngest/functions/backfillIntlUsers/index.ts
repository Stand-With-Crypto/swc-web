import { NonRetriableError } from 'inngest'
import { chunk } from 'lodash-es'
import { read, utils } from 'xlsx'
import { z } from 'zod'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { logger } from '@/utils/shared/logger'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodEmailAddress } from '@/validation/fields/zodEmailAddress'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodPhoneNumberWithCountryCode } from '@/validation/fields/zodPhoneNumber'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

import { processIntlUsersBatch } from './logic'

export const BACKFILL_INTL_USERS_INNGEST_EVENT_NAME = 'script/backfill-intl-users'
export const BACKFILL_INTL_USERS_FUNCTION_ID = 'script.backfill-intl-users'

const BATCH_SIZE = 1000

const createUserDataSchema = (countryCode: SupportedCountryCodes) => {
  // Map  CSV columns to our expected field names
  return z.preprocess(
    data => {
      if (typeof data !== 'object' || data === null) return data

      const csvFieldNames: Record<string, string> = { ...data }

      if ('What is your name?' in csvFieldNames) {
        csvFieldNames.firstName = csvFieldNames['What is your name?']
        csvFieldNames.lastName = ''
      }

      if ('What is your email?' in csvFieldNames) {
        csvFieldNames.email = csvFieldNames['What is your email?']
      }

      return csvFieldNames
    },
    z.object({
      firstName: z.union([zodFirstName.optional(), z.literal('')]),
      lastName: z.union([zodLastName.optional(), z.literal('')]),
      email: zodEmailAddress,
      phoneNumber: z.union([zodPhoneNumberWithCountryCode(countryCode), z.literal('')]).optional(),
    }),
  )
}

export type UserData = z.infer<ReturnType<typeof createUserDataSchema>>

const eventPayloadSchema = z.object({
  countryCode: zodSupportedCountryCode,
  csvData: z.string().min(1, 'CSV data is required'),
  persist: z.boolean().optional().default(false),
})

export type BackfillIntlUsersSchema = {
  name: typeof BACKFILL_INTL_USERS_INNGEST_EVENT_NAME
  data: z.infer<typeof eventPayloadSchema>
}

export const backfillIntlUsersWithInngest = inngest.createFunction(
  {
    id: BACKFILL_INTL_USERS_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_INTL_USERS_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payloadValidation = eventPayloadSchema.safeParse(event.data)
    if (!payloadValidation.success) {
      throw new NonRetriableError(`Invalid event payload: ${payloadValidation.error.message}`)
    }

    const { countryCode, csvData, persist } = payloadValidation.data

    const { batches, totalUsers, validUsers, invalidUsers } = await step.run(
      'parse-csv',
      async () => {
        const buffer = Buffer.from(csvData, 'base64')
        const workbook = read(buffer, { type: 'buffer' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawUsers = utils.sheet_to_json<Record<string, unknown>>(worksheet)

        const userDataSchema = createUserDataSchema(countryCode)
        const errorsByType = new Map<
          string,
          { count: number; examples: Array<{ rawUserData: unknown; message: string }> }
        >()

        const processedResults = rawUsers.reduce<{
          validUsers: UserData[]
          invalidCount: number
        }>(
          (acc, rawUser) => {
            const result = userDataSchema.safeParse(rawUser)
            if (result.success) {
              acc.validUsers.push(result.data)
            } else {
              acc.invalidCount++
              result.error.errors.forEach(err => {
                const errorKey = `${err.path.join('.')}: ${err.code}`
                const current = errorsByType.get(errorKey) || { count: 0, examples: [] }
                current.examples.push({
                  rawUserData: err.path.length ? rawUser[err.path[0]] : rawUser,
                  message: err.message,
                })
                errorsByType.set(errorKey, {
                  count: current.count + 1,
                  examples: current.examples,
                })
              })
            }

            return acc
          },
          { validUsers: [], invalidCount: 0 },
        )

        const validUsers = processedResults.validUsers

        if (processedResults.invalidCount > 0) {
          logger.warn(
            `Found ${processedResults.invalidCount} invalid user records that will be skipped`,
          )
          errorsByType.forEach((data, errorType) => {
            logger.warn(`Error type: ${errorType} - found ${data.count} occurrences`)
            data.examples.forEach((example, i) => {
              logger.warn(
                `Example ${i + 1}: ${JSON.stringify(example.rawUserData)} - ${example.message}`,
              )
            })
          })
        }

        logger.info(
          `Found ${validUsers.length} valid users to process for country code ${countryCode}`,
        )

        const batches = chunk(validUsers, BATCH_SIZE)
        logger.info(`Split data into ${batches.length} batches for processing`)

        return {
          batches,
          totalUsers: rawUsers.length,
          validUsers: validUsers.length,
          invalidUsers: processedResults.invalidCount,
          errorsByType: Object.fromEntries(errorsByType),
        }
      },
    )

    if (totalUsers === 0 || validUsers === 0) {
      logger.info(`No valid users found to process for country code ${countryCode}`)
      return {
        message: `No valid users found to process for country code ${countryCode}`,
        countryCode,
        totalUsers,
        validUsers,
        invalidUsers,
      }
    }

    for (const [batchIndex, batch] of batches.entries()) {
      await step.invoke(`dispatch-batch-of-users-${batchIndex + 1}`, {
        function: processIntlUsersBatch,
        data: {
          countryCode,
          users: batch,
          batchIndex: batchIndex + 1,
          totalBatches: batches.length,
          persist,
        },
      })
    }

    return {
      message: `Processed ${totalUsers} valid users for country code ${countryCode} in ${batches.length} batches`,
      countryCode,
      totalUsers,
      validUsers,
      invalidUsers,
      batches: batches.length,
    }
  },
)
