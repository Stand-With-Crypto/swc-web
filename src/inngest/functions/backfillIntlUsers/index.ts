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
  return z.object({
    firstName: zodFirstName.optional().transform(v => v || ''),
    lastName: zodLastName.optional().transform(v => v || ''),
    email: zodEmailAddress,
    phoneNumber: z.union([zodPhoneNumberWithCountryCode(countryCode), z.literal('')]).optional(),
  })
}

export type UserData = z.infer<ReturnType<typeof createUserDataSchema>>

const eventPayloadSchema = z.object({
  countryCode: zodSupportedCountryCode,
  csvData: z.string().min(1, 'CSV data is required'),
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

    const { countryCode, csvData } = payloadValidation.data

    const { users, totalUsers, invalidCount } = await step.run('parse-csv', async () => {
      try {
        const buffer = Buffer.from(csvData, 'base64')
        const workbook = read(buffer, { type: 'buffer' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawUsers = utils.sheet_to_json<Record<string, unknown>>(worksheet)

        const userDataSchema = createUserDataSchema(countryCode)
        const validatedResults = rawUsers.map(rawUser => {
          const result = userDataSchema.safeParse(rawUser)
          return {
            isValid: result.success,
            data: result.success ? result.data : null,
            error: !result.success ? result.error.message : null,
            rawData: rawUser,
          }
        })

        const invalidUsers = validatedResults.filter(r => !r.isValid)
        const validUsers = validatedResults.filter(r => r.isValid).map(r => r.data) as UserData[]

        if (invalidUsers.length > 0) {
          logger.warn(`Found ${invalidUsers.length} invalid user records that will be skipped`)
          invalidUsers.slice(0, 5).forEach(invalid => {
            logger.warn(
              `Invalid user: ${JSON.stringify(invalid.rawData)}, Error: ${invalid.error || 'Unknown validation error'}`,
            )
          })
        }

        logger.info(
          `Found ${validUsers.length} valid users to process for country code ${countryCode}`,
        )
        return {
          users: validUsers,
          totalUsers: validUsers.length,
          invalidCount: invalidUsers.length,
        }
      } catch (error) {
        logger.error(
          `Error parsing data: ${error instanceof Error ? error.message : String(error)}`,
        )
        throw error
      }
    })

    if (totalUsers === 0) {
      return {
        message: `No valid users found to process for country code ${countryCode}`,
        countryCode,
        totalUsers: 0,
        invalidCount,
      }
    }

    const batches = chunk(users, BATCH_SIZE)
    logger.info(`Split data into ${batches.length} batches for processing`)

    for (const [batchIndex, batch] of batches.entries()) {
      logger.info(`Dispatching batch ${batchIndex + 1}/${batches.length}`)
      await step.invoke(`dispatch-batch-of-users-${batchIndex}`, {
        function: processIntlUsersBatch,
        data: {
          countryCode,
          users: batch,
          batchIndex: batchIndex + 1,
          totalBatches: batches.length,
        },
      })
    }

    return {
      message: `Processing ${totalUsers} valid users for country code ${countryCode} in ${batches.length} batches`,
      countryCode,
      totalUsers,
      invalidCount,
      batches: batches.length,
    }
  },
)
