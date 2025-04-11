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
import { zodOptionalEmptyPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { zodReferralId } from '@/validation/fields/zodReferralId'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

import { processIntlUsersBatch } from './logic'

export const BACKFILL_INTL_USERS_INNGEST_EVENT_NAME = 'script/backfill-intl-users'
export const BACKFILL_INTL_USERS_FUNCTION_ID = 'script.backfill-intl-users'

const BATCH_SIZE = 500

const zodUserDataSchema = (countryCode: SupportedCountryCodes) =>
  z.object({
    email: zodEmailAddress,
    firstName: z.union([zodFirstName.optional(), z.literal('')]),
    lastName: z.union([zodLastName.optional(), z.literal('')]),
    referralId: zodReferralId.optional(),
    phoneNumber: zodOptionalEmptyPhoneNumber(countryCode).optional(),
    countryCode: zodSupportedCountryCode,
  })

export type UserData = z.infer<ReturnType<typeof zodUserDataSchema>>

const createUserDataSchema = (countryCode: SupportedCountryCodes) => {
  // Map  CSV columns to our expected field names
  return z.preprocess(data => {
    if (!data || typeof data !== 'object') return data

    const typedData = data as Record<string, string>
    const userData: UserData = {} as UserData

    if ('What is your name?' in typedData && Boolean(typedData['What is your name?'])) {
      userData.firstName = typedData['What is your name?']
      userData.lastName = ''
    }

    if ('What is your email?' in typedData && Boolean(typedData['What is your email?'])) {
      userData.email = typedData['What is your email?']
    }

    if ('Waitlist Referral URL' in typedData && Boolean(typedData['Waitlist Referral URL'])) {
      try {
        const url = new URL(typedData['Waitlist Referral URL'])
        const referralParam = url.searchParams.get('referral')
        if (referralParam) {
          userData.referralId = referralParam
        }
      } catch (error) {
        logger.error(`Error parsing referral URL: ${typedData['Waitlist Referral URL']}`, {
          error,
        })
      }
    }

    if ('Purchaser country' in typedData && Boolean(typedData['Purchaser country'])) {
      userData.countryCode = typedData['Purchaser country'] as SupportedCountryCodes
    } else {
      userData.countryCode = countryCode
    }

    if ('Buyer email' in typedData && Boolean(typedData['Buyer email'])) {
      userData.email = typedData['Buyer email']
    }

    if ('Buyer first name' in typedData && Boolean(typedData['Buyer first name'])) {
      userData.firstName = typedData['Buyer first name']
    }

    if ('Buyer last name' in typedData && Boolean(typedData['Buyer last name'])) {
      userData.lastName = typedData['Buyer last name']
    }

    if ('Phone number' in typedData && Boolean(typedData['Phone number'])) {
      userData.phoneNumber = typedData['Phone number']
    }

    return userData
  }, zodUserDataSchema(countryCode))
}

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

        const columns = [
          // AU, CA, GB csv columns
          'What is your name?',
          'What is your email?',
          'Waitlist Referral URL',
          // ZEBU live event csv columns
          'Buyer first name',
          'Buyer last name',
          'Buyer email',
          'Phone number',
          'Purchaser country',
        ]

        const headerRow =
          utils.sheet_to_json<string[]>(worksheet, {
            header: 1,
            range: 0,
          })[0] || []

        const customHeader = headerRow.map(header => (columns.includes(header) ? header : ''))

        const rawUsers = utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          header: customHeader,
          range: 1,
          blankrows: false,
          defval: '',
        })

        const userDataSchema = createUserDataSchema(countryCode)
        const errorsByType = new Map<
          string,
          {
            count: number
            examples: Array<{ message: string; rawUser: unknown }>
          }
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
                  rawUser,
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
                `Example ${i + 1}: ${JSON.stringify(example.rawUser)} - ${example.message}`,
              )
            })
          })
        }

        logger.info(
          `Found ${validUsers.length} valid users to process out of ${rawUsers.length} data rows read for country code ${countryCode}`,
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
      message: `Processed ${validUsers}/${totalUsers} users for country code "${countryCode}" in ${batches.length} batches`,
      countryCode,
      totalUsers,
      validUsers,
      invalidUsers,
      batches: batches.length,
    }
  },
)
