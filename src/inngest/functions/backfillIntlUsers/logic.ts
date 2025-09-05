import {
  DataCreationMethod,
  SMSStatus,
  User,
  UserActionOptInType,
  UserActionType,
  UserEmailAddressSource,
  UserInformationVisibility,
} from '@prisma/client'
import { NonRetriableError } from 'inngest'
import pRetry from 'p-retry'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import type { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { generateUserSessionId } from '@/utils/shared/userSessionId'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

import type { UserData } from './index'

export const BACKFILL_INTL_USERS_PROCESSOR_EVENT_NAME = 'script/backfill-intl-users.processor'
export const BACKFILL_INTL_USERS_PROCESSOR_FUNCTION_ID = 'script.backfill-intl-users.processor'

export interface BackfillIntlUsersProcessorSchema {
  name: typeof BACKFILL_INTL_USERS_PROCESSOR_EVENT_NAME
  data: {
    countryCode: string
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

const getLog = (persist: boolean) => {
  return getLogger(`backfill-intl-users ${persist ? '' : '[DRY RUN]'}`)
}

export const backfillIntlUsersProcessor = inngest.createFunction(
  {
    id: BACKFILL_INTL_USERS_PROCESSOR_FUNCTION_ID,
    onFailure: onScriptFailure,
    concurrency: 10,
  },
  { event: BACKFILL_INTL_USERS_PROCESSOR_EVENT_NAME },
  async ({ event, step }) => {
    const { countryCode, users, batchIndex, totalBatches, persist } = event.data

    const countryCodeValidation = zodSupportedCountryCode.safeParse(countryCode)
    if (!countryCodeValidation.success) {
      throw new NonRetriableError(`Invalid country code: ${countryCodeValidation.error.message}`)
    }

    const validCountryCode = countryCodeValidation.data

    const logger = getLog(persist)

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

          if (userResult.action === 'created') {
            results.created++
          } else if (userResult.action === 'updated') {
            results.updated++
          } else if (userResult.action === 'skipped') {
            results.skipped++
          } else if (userResult.action === 'error') {
            results.errors++
            logger.error(`Failed to process user: ${userResult.error || 'Unknown error'}`, {
              email: userResult.email,
              countryCode: validCountryCode,
            })
          }
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
  const logger = getLog(persist)

  const existingUser = await prismaClient.userEmailAddress.findFirst({
    where: { emailAddress },
  })

  if (existingUser) {
    return {
      action: 'skipped',
      email: existingUser.emailAddress,
    }
  }

  let newUser: User | undefined
  if (persist) {
    newUser = await prismaClient.$transaction(
      async tx => {
        const user = await tx.user.create({
          data: {
            firstName: userData.firstName || undefined,
            lastName: userData.lastName || undefined,
            informationVisibility: UserInformationVisibility.ANONYMOUS,
            hasOptedInToEmails: Boolean(emailAddress),
            hasOptedInToMembership: false,
            smsStatus: SMSStatus.NOT_OPTED_IN,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            userSessions: { create: { id: generateUserSessionId() } },
            countryCode,
            referralId: generateReferralId(),
            acquisitionReferer: '',
            acquisitionSource: userData.acquisitionSource,
            acquisitionMedium: userData.acquisitionMedium,
            acquisitionCampaign: userData.acquisitionCampaign,
          },
        })

        const emailRecord = await tx.userEmailAddress.create({
          data: {
            emailAddress,
            isVerified: false,
            source: UserEmailAddressSource.USER_ENTERED,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            userId: user.id,
          },
        })

        await tx.user.update({
          where: { id: user.id },
          data: { primaryUserEmailAddressId: emailRecord.id },
        })

        await tx.userAction.create({
          data: {
            user: { connect: { id: user.id } },
            actionType: UserActionType.OPT_IN,
            campaignName: getActionDefaultCampaignName(UserActionType.OPT_IN, countryCode),
            countryCode,
            userActionOptIn: {
              create: {
                optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
              },
            },
          },
        })

        return user
      },
      {
        timeout: 15000,
        maxWait: 15000,
      },
    )
  }

  logger.info(`Created new user: ${emailAddress}`)
  return {
    action: 'created',
    userId: newUser?.id,
    email: emailAddress,
  }
}
