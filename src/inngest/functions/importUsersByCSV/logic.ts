import { UserActionOptInType } from '@prisma/client'
import { NonRetriableError } from 'inngest'
import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { handleExternalUserActionOptIn } from '@/utils/server/externalOptIn/handleExternalUserActionOptIn'
import {
  ExternalUserActionOptInResult,
  Input as ExternalUserActionOptInInput,
} from '@/utils/server/externalOptIn/types'
import { getLogger } from '@/utils/shared/logger'
import { validatePhoneNumber } from '@/utils/shared/phoneNumber'
import type { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

import type { UserData } from './index'

export const IMPORT_USERS_BY_CSV_PROCESSOR_EVENT_NAME = 'script/import-users-by-csv.processor'
export const IMPORT_USERS_BY_CSV_PROCESSOR_FUNCTION_ID = 'script.import-users-by-csv.processor'

export interface ImportUsersByCSVProcessorSchema {
  name: typeof IMPORT_USERS_BY_CSV_PROCESSOR_EVENT_NAME
  data: {
    countryCode: SupportedCountryCodes
    users: Array<UserData>
    batchIndex: number
    totalBatches: number
    persist: boolean
  }
}

interface UserProcessingResult {
  action: 'created' | 'updated' | 'skipped' | 'error'
  email: string
  userId?: string
  error?: string
}

export const importUsersByCSVProcessor = inngest.createFunction(
  {
    id: IMPORT_USERS_BY_CSV_PROCESSOR_FUNCTION_ID,
    onFailure: onScriptFailure,
    concurrency: 10,
  },
  { event: IMPORT_USERS_BY_CSV_PROCESSOR_EVENT_NAME },
  async ({ event, step }) => {
    const { countryCode, users, batchIndex, totalBatches, persist } = event.data

    const countryCodeValidation = zodSupportedCountryCode.safeParse(countryCode)
    if (!countryCodeValidation.success) {
      throw new NonRetriableError(`Invalid country code: ${countryCodeValidation.error.message}`)
    }

    const validCountryCode = countryCodeValidation.data

    const logger = getLogger('import-users-by-csv')

    const stats = await step.run(`process-users-batch-${batchIndex}`, async () => {
      logger.info(
        `Processing batch ${batchIndex}/${totalBatches} with ${users.length} users for country code ${validCountryCode}`,
      )

      const results = {
        total: users.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
      }

      const userPromises = users.map(async (user: UserData) =>
        pRetry(async () => createUserWithCountryCode(user, validCountryCode, persist), {
          onFailedAttempt: error => {
            if (error.retriesLeft === 0) {
              logger.error(`Failed to process user: ${error.message}`, {
                email: user.email,
                countryCode: validCountryCode,
              })
            }
          },
        }),
      )

      const userResults = await Promise.allSettled(userPromises)

      for (const result of userResults) {
        if (result.status === 'fulfilled') {
          const userResult = result.value

          if (userResult.action === 'error') {
            results.errors++
            logger.error(`Failed to process user: ${userResult.error || 'Unknown error'}`, {
              email: userResult.email,
              countryCode: validCountryCode,
            })
            continue
          }

          if (userResult.action === 'skipped') {
            results.skipped++
            continue
          }

          results.created++
        } else {
          results.errors++
          logger.error(`Promise rejected: ${String(result.reason)}`)
        }
      }

      return results
    })

    return {
      batchIndex,
      countryCode: validCountryCode,
      stats,
    }
  },
)

async function createUserWithCountryCode(
  userData: UserData,
  countryCode: SupportedCountryCodes,
  persist: boolean,
): Promise<UserProcessingResult> {
  const emailAddress = userData.email

  const logger = getLogger('create-user')

  try {
    // Transform UserData to Input type for handleExternalUserActionOptIn
    const hasValidPhoneNumber = userData.phoneNumber
      ? validatePhoneNumber(userData.phoneNumber, countryCode)
      : false

    const campaignName = userData.acquisitionCampaign

    const data: ExternalUserActionOptInInput = {
      emailAddress: userData.email,
      optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      campaignName,
      isVerifiedEmailAddress: false,
      firstName: userData.firstName || undefined,
      lastName: userData.lastName || undefined,
      phoneNumber: userData.phoneNumber,
      hasOptedInToReceiveSMSFromSWC: userData.smsOptIn || false,
      hasOptedInToEmails: true,
      hasOptedInToMembership: false,
      countryCode,
      hasValidPhoneNumber,
      acquisitionOverride: {
        source: userData.acquisitionSource,
        medium: userData.acquisitionMedium,
      },
      additionalAnalyticsProperties: {
        campaign: campaignName,
        import_method: 'csv_bulk_import',
      },
    }

    // Debug logging for SMS opt-in
    if (userData.smsOptIn) {
      logger.info(`SMS opt-in requested for ${emailAddress}`, {
        phoneNumber: userData.phoneNumber,
        hasValidPhoneNumber,
        hasOptedInToReceiveSMSFromSWC: data.hasOptedInToReceiveSMSFromSWC,
        smsOptInWillTrigger:
          data.hasOptedInToReceiveSMSFromSWC && data.phoneNumber && hasValidPhoneNumber,
      })
    }

    if (!persist) {
      return {
        action: 'skipped',
        email: emailAddress,
      }
    }

    const result = await handleExternalUserActionOptIn(data)

    if (result.result === ExternalUserActionOptInResult.EXISTING_ACTION) {
      logger.info(`User already exists: ${emailAddress}`)
      return {
        action: 'skipped',
        email: emailAddress,
        userId: result.userId,
      }
    }

    if (result.result === ExternalUserActionOptInResult.NEW_ACTION) {
      logger.info(`Created new user: ${emailAddress}`)
      return {
        action: 'created',
        email: emailAddress,
        userId: result.userId,
      }
    }

    // Handle unexpected result types (should never happen, but good for debugging)
    logger.error(`Unexpected result type: ${String(result.result)} for user: ${emailAddress}`)
    return {
      action: 'error',
      email: emailAddress,
      error: `Unexpected result type: ${String(result.result)}`,
    }
  } catch (error) {
    logger.error(
      `Failed to process user ${emailAddress}: ${error instanceof Error ? error.message : String(error)}`,
    )
    return {
      action: 'error',
      email: emailAddress,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
