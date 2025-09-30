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
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

import { importUsersByCSVProcessor } from './logic'

export const IMPORT_USERS_BY_CSV_COORDINATOR_EVENT_NAME = 'script/import-users-by-csv.coordinator'
export const IMPORT_USERS_BY_CSV_COORDINATOR_FUNCTION_ID = 'script.import-users-by-csv.coordinator'

const BATCH_SIZE = 250

const createUserDataSchema = ({
  acquisitionSource,
  acquisitionMedium,
  acquisitionCampaign,
  countryCode,
}: {
  acquisitionSource?: string
  acquisitionMedium?: string
  acquisitionCampaign?: string
  countryCode: SupportedCountryCodes
}) => {
  /** Map CSV columns to our expected field names */
  return z.preprocess(
    csvData => {
      if (typeof csvData !== 'object' || csvData === null) return csvData

      const formattedFields: Record<string, string | boolean> = {
        smsOptIn: false,
      }

      if ('first_name' in csvData && Boolean(csvData['first_name'])) {
        formattedFields.firstName = (csvData['first_name'] as string) || ''
        formattedFields.lastName = ''
      }

      if ('last_name' in csvData && Boolean(csvData['last_name'])) {
        formattedFields.lastName = (csvData['last_name'] as string) || ''
      }

      if ('email' in csvData && Boolean(csvData['email'])) {
        formattedFields.email = csvData['email'] as string
      }

      if ('sms_opt_in' in csvData && Boolean(csvData['sms_opt_in'])) {
        formattedFields.smsOptIn = true
      }

      if ('phone_number' in csvData && Boolean(csvData['phone_number'])) {
        formattedFields.phoneNumber = String(csvData['phone_number'])
      }

      if (acquisitionSource) {
        formattedFields.acquisitionSource = acquisitionSource
      }
      if (acquisitionMedium) {
        formattedFields.acquisitionMedium = acquisitionMedium
      }
      if (acquisitionCampaign) {
        formattedFields.acquisitionCampaign = acquisitionCampaign
      }

      return { ...csvData, ...formattedFields }
    },
    z.object({
      email: zodEmailAddress,
      phoneNumber: zodPhoneNumber(countryCode).optional(),
      firstName: z.union([zodFirstName.optional(), z.literal('')]),
      lastName: z.union([zodLastName.optional(), z.literal('')]),
      smsOptIn: z.boolean().optional().default(false),
      acquisitionSource: z.string().optional().default('IMPORT_BY_CSV'),
      acquisitionMedium: z.string().optional().default('IMPORT_BY_CSV'),
      acquisitionCampaign: z.string().optional().default('IMPORT_BY_CSV'),
    }),
  )
}

export type UserData = z.infer<ReturnType<typeof createUserDataSchema>>

const eventPayloadSchema = z.object({
  countryCode: zodSupportedCountryCode,
  csvData: z.string().min(1, 'CSV data is required'),
  acquisitionSource: z.string().optional(),
  acquisitionMedium: z.string().optional(),
  acquisitionCampaign: z.string().optional(),
})

export interface ImportUsersByCSVCoordinatorSchema {
  name: typeof IMPORT_USERS_BY_CSV_COORDINATOR_EVENT_NAME
  data: z.infer<typeof eventPayloadSchema>
}

export const importUsersByCSVCoordinator = inngest.createFunction(
  {
    id: IMPORT_USERS_BY_CSV_COORDINATOR_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  { event: IMPORT_USERS_BY_CSV_COORDINATOR_EVENT_NAME },
  async ({ event, step }) => {
    const payloadValidation = eventPayloadSchema.safeParse(event.data)
    if (!payloadValidation.success) {
      throw new NonRetriableError(`Invalid event payload: ${payloadValidation.error.message}`)
    }

    const { countryCode, csvData, acquisitionSource, acquisitionMedium, acquisitionCampaign } =
      payloadValidation.data

    const { batches, totalUsers, validUsers, invalidUsers } = await step.run(
      'parse-csv',
      async () => {
        const buffer = Buffer.from(csvData, 'base64')
        const workbook = read(buffer, { type: 'buffer' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawUsers = utils.sheet_to_json<Record<string, unknown>>(worksheet)

        const userDataSchema = createUserDataSchema({
          acquisitionSource,
          acquisitionMedium,
          acquisitionCampaign,
          countryCode,
        })
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
        function: importUsersByCSVProcessor,
        data: {
          countryCode,
          users: batch,
          batchIndex: batchIndex + 1,
          totalBatches: batches.length,
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
