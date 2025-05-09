import { NonRetriableError } from 'inngest'

import { checkCustomFields } from '@/inngest/functions/sendgridContactsCronJob/checkCustomFields'
import {
  checkSendgridJobStatus,
  SendgridImportJobStatusResponse,
} from '@/inngest/functions/sendgridContactsCronJob/checkJobStatus'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import { syncSendgridContactsProcessor } from './logic'

export const SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME =
  'script/sync-sendgrid-contacts-coordinator'
export const SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID =
  'script.sync-sendgrid-contacts-coordinator'

const STEP_OUTPUT_SIZE_LIMIT = 500

export interface SyncSendgridContactsCoordinatorSchema {
  name: typeof SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME
}

interface CountryProcessingBatchResult {
  success: boolean
  jobId: string | null
  validContactsCount?: number
  method?: string
  error?: string
  usersCount?: number
}

interface CountryProcessingResult {
  countryCode: SupportedCountryCodes
  totalUsers: number
  batchesResults: CountryProcessingBatchResult[]
}

export const syncSendgridContactsCoordinator = inngest.createFunction(
  { id: SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID, onFailure: onScriptFailure },
  { event: SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME },
  async ({ step, logger }) => {
    await step.run('ensure-custom-fields-exist', async () => {
      try {
        return await checkCustomFields()
      } catch (error) {
        logger.error('Custom Fields check failed', { error })
        throw new NonRetriableError(`Custom Fields check failed`)
      }
    })

    // Skip US for now
    const countriesToProcess = ORDERED_SUPPORTED_COUNTRIES.filter(
      countryCode => countryCode !== SupportedCountryCodes.US,
    )

    const countryProcessingPromises = countriesToProcess.map(
      async (countryCode): Promise<CountryProcessingResult> => {
        const userCount = await step.run(`count-${countryCode}-users`, async () => {
          return prismaClient.user.count({
            where: {
              countryCode,
              primaryUserEmailAddressId: { not: null },
            },
          })
        })

        if (userCount === 0) {
          logger.info(`No users found for country code ${countryCode}, skipping.`)
          return {
            countryCode,
            totalUsers: 0,
            batchesResults: [],
          }
        }

        logger.info(`Found ${userCount} users for country ${countryCode}`)
        const numDbChunks = Math.ceil(userCount / STEP_OUTPUT_SIZE_LIMIT)
        logger.info(
          `Processing ${countryCode} users in ${numDbChunks} DB chunks of up to ${STEP_OUTPUT_SIZE_LIMIT} users each`,
        )

        const batchPromises: Promise<CountryProcessingBatchResult>[] = []
        for (let chunkIndex = 0; chunkIndex < numDbChunks; chunkIndex++) {
          const take = STEP_OUTPUT_SIZE_LIMIT
          const skip = chunkIndex * STEP_OUTPUT_SIZE_LIMIT

          logger.info(
            `Queueing DB fetch for chunk ${chunkIndex + 1}/${numDbChunks} for ${countryCode}: skip=${skip}, take=${take}`,
          )

          const batchProcessingPromise = async (): Promise<CountryProcessingBatchResult> => {
            const users = await step.run(
              `fetch-${countryCode}-users-db-chunk-${chunkIndex}`,
              async () => {
                return prismaClient.user.findMany({
                  where: {
                    countryCode,
                    primaryUserEmailAddressId: { not: null },
                  },
                  select: {
                    id: true,
                    primaryUserEmailAddress: {
                      select: { emailAddress: true },
                    },
                    userActions: {
                      select: { actionType: true, campaignName: true },
                    },
                    address: {
                      select: {
                        formattedDescription: true,
                        locality: true,
                        administrativeAreaLevel1: true,
                        postalCode: true,
                      },
                    },
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    countryCode: true,
                    datetimeCreated: true,
                    userSessions: {
                      select: { id: true },
                    },
                  },
                  skip,
                  take,
                })
              },
            )

            if (!users.length) {
              logger.warn(
                `DB chunk ${chunkIndex + 1}/${numDbChunks} for ${countryCode} (fetch step: fetch-${countryCode}-users-db-chunk-${chunkIndex}) returned no users. This should not happen if count > 0.`,
              )
              return {
                success: false,
                jobId: null,
                error: 'No users found in chunk despite positive count',
                validContactsCount: 0,
              }
            }

            return step.invoke(`sync-${countryCode}-contacts-batch-${chunkIndex}`, {
              function: syncSendgridContactsProcessor,
              data: {
                countryCode,
                users,
              },
            })
          }
          batchPromises.push(batchProcessingPromise())
        }

        const batchesResults = await Promise.all(batchPromises)
        return {
          countryCode,
          totalUsers: userCount,
          batchesResults,
        }
      },
    )

    const allCountriesResults = await Promise.all(countryProcessingPromises)

    const jobIdsToMonitor: string[] = []
    allCountriesResults.forEach(countryResult => {
      countryResult.batchesResults.forEach(batchResult => {
        if (batchResult.jobId) {
          jobIdsToMonitor.push(batchResult.jobId)
        }
      })
    })

    let sendgridJobResults: SendgridImportJobStatusResponse[] = []
    if (jobIdsToMonitor.length > 0) {
      sendgridJobResults = await step.run('check-all-sendgrid-job-statuses', async () => {
        const statusPromises = jobIdsToMonitor.map(jobId => checkSendgridJobStatus(jobId))
        const results = await Promise.allSettled(statusPromises)
        return results
          .map(result => {
            if (result.status === 'fulfilled') {
              return result.value
            }
            return null
          })
          .filter(Boolean) as SendgridImportJobStatusResponse[]
      })
    } else {
      logger.info('No SendGrid jobs were submitted; skipping status check phase.')
    }

    return {
      results: allCountriesResults,
      sendgridJobResults,
    }
  },
)
