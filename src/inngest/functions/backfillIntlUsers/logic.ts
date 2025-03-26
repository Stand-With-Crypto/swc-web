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

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { generateReferralId } from '@/utils/shared/referralId'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'
import { generateUserSessionId } from '@/utils/shared/userSessionId'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

import type { UserData } from './index'

export const PROCESS_BATCH_EVENT_NAME = 'script/backfill-intl-users.process-batch'
export const PROCESS_BATCH_FUNCTION_ID = 'script.backfill-intl-users.process-batch'

export type ProcessBatchSchema = {
  name: typeof PROCESS_BATCH_EVENT_NAME
  data: {
    countryCode: string
    users: Array<UserData>
    batchIndex: number
    totalBatches: number
    persist: boolean
  }
}

type UserProcessingResult = {
  action: 'created' | 'updated' | 'skipped' | 'error'
  email: string
  userId?: string
  error?: string
}

const getLog = (persist: boolean) => {
  return getLogger(`backfill-intl-users ${persist ? '' : '[DRY RUN]'}`)
}

export const processIntlUsersBatch = inngest.createFunction(
  {
    id: PROCESS_BATCH_FUNCTION_ID,
    onFailure: onScriptFailure,
  },
  { event: PROCESS_BATCH_EVENT_NAME },
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

      const userPromises = users.map(user =>
        createUserWithCountryCode(user, validCountryCode, persist),
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
  countryCode: string,
  persist: boolean,
): Promise<UserProcessingResult> {
  const emailAddress = userData.email
  const logger = getLog(persist)

  try {
    const existingUser = await prismaClient.userEmailAddress.findFirst({
      where: { emailAddress },
      include: { user: true },
    })

    if (existingUser) {
      const result = await handleExistingUser({
        existingUser: existingUser.user,
        countryCode,
        persist,
      })

      return {
        ...result,
        email: existingUser.emailAddress,
      }
    }

    let newUser: User | undefined
    if (persist) {
      newUser = await prismaClient.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            informationVisibility: UserInformationVisibility.ANONYMOUS,
            hasOptedInToEmails: Boolean(emailAddress),
            hasOptedInToMembership: false,
            smsStatus: SMSStatus.NOT_OPTED_IN,
            dataCreationMethod: DataCreationMethod.INITIAL_BACKFILL,
            referralId: userData.referralId || generateReferralId(),
            userSessions: { create: { id: generateUserSessionId() } },
            countryCode,
            acquisitionReferer: '',
            acquisitionSource: 'INTL_BACKFILL_CSV',
            acquisitionMedium: 'INTL_BACKFILL_CSV',
            acquisitionCampaign: 'INTL_BACKFILL_CSV',
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
            campaignName: UserActionOptInCampaignName.DEFAULT,
            countryCode,
            userActionOptIn: {
              create: {
                optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
              },
            },
          },
        })

        return user
      })
    }

    logger.info(`Created new user: ${emailAddress}`)
    return {
      action: 'created',
      userId: newUser?.id,
      email: emailAddress,
    }
  } catch (error) {
    return {
      action: 'error',
      email: emailAddress,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const handleExistingUser = async ({
  existingUser,
  countryCode,
  persist,
}: {
  countryCode: string
  existingUser: User
  persist: boolean
}) => {
  const logger = getLog(persist)

  if (existingUser.countryCode !== countryCode) {
    try {
      if (persist) {
        await prismaClient.user.update({ where: { id: existingUser.id }, data: { countryCode } })
      }
      logger.info(`Updated country code for existing user: ${existingUser.id}`)
      return {
        action: 'updated',
        userId: existingUser.id,
      } as const
    } catch (error) {
      return {
        action: 'error',
        userId: existingUser.id,
        error: error instanceof Error ? error.message : String(error),
      } as const
    }
  }

  return {
    action: 'skipped',
    userId: existingUser.id,
  } as const
}
