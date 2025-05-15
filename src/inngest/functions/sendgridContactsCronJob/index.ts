import { NonRetriableError } from 'inngest'

import { checkCustomFields } from '@/inngest/functions/sendgridContactsCronJob/checkCustomFields'
import {
  checkSendgridJobStatus,
  SendgridImportJobStatusResponse,
} from '@/inngest/functions/sendgridContactsCronJob/checkJobStatus'
import {
  COUNTRIES_TO_SYNC,
  DB_READ_LIMIT,
} from '@/inngest/functions/sendgridContactsCronJob/config'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { syncSendgridContactsProcessor } from './logic'

export const SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME =
  'script/sync-sendgrid-contacts-coordinator'
export const SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID =
  'script.sync-sendgrid-contacts-coordinator'
const SYNC_SENDGRID_CONTACTS_COORDINATOR_CRON_JOB_SCHEDULE = '0 */6 * * *' // every 6 hours

export interface SyncSendgridContactsCoordinatorSchema {
  name: typeof SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME
}

interface BatchResult {
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
  fullfilledBatches: BatchResult[]
  failedBatches: BatchResult[]
  errors: PromiseSettledResult<BatchResult>[]
}

export const syncSendgridContactsCoordinator = inngest.createFunction(
  { id: SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID, onFailure: onScriptFailure },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: SYNC_SENDGRID_CONTACTS_COORDINATOR_CRON_JOB_SCHEDULE }
      : { event: SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    await step.run('ensure-custom-fields-exist', async () => {
      try {
        return await checkCustomFields()
      } catch (error) {
        logger.error('Custom Fields check failed', { error })
        throw new NonRetriableError(`Custom Fields check failed`)
      }
    })

    const countriesPromises = COUNTRIES_TO_SYNC.map(
      async (countryCode): Promise<CountryProcessingResult> => {
        const userCount = await step.run(`[${countryCode}]-count-users`, async () => {
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
            fullfilledBatches: [],
            failedBatches: [],
            errors: [],
          }
        }

        const numDbChunks = Math.ceil(userCount / DB_READ_LIMIT)
        logger.info(
          `Processing ${countryCode} users in ${numDbChunks} batches of up to ${DB_READ_LIMIT} users each`,
        )

        const promises = []
        for (let chunkIndex = 0; chunkIndex < numDbChunks; chunkIndex++) {
          const take = DB_READ_LIMIT
          const skip = chunkIndex * DB_READ_LIMIT
          const createBatchPromise = async (): Promise<BatchResult> => {
            const users = await prismaClient.user.findMany({
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
            return step.invoke(`[${countryCode}]-sync-contacts.batch-${chunkIndex}`, {
              function: syncSendgridContactsProcessor,
              data: {
                countryCode,
                users,
              },
            })
          }
          logger.info(
            `Queueing batch ${chunkIndex + 1}/${numDbChunks} for ${countryCode}: skip=${skip}, take=${take}`,
          )
          promises.push(createBatchPromise())
        }

        const batchesResults = await Promise.allSettled(promises)
        const successfulBatches: BatchResult[] = []
        const failedBatches: BatchResult[] = []
        const errors: PromiseSettledResult<BatchResult>[] = []
        batchesResults.forEach(batchResult => {
          if (batchResult.status === 'fulfilled' && batchResult.value.success) {
            successfulBatches.push(batchResult.value)
          } else if (batchResult.status === 'fulfilled' && !batchResult.value.success) {
            failedBatches.push(batchResult.value)
          } else {
            logger.error('Batch processing failed', { batchResult })
            errors.push(batchResult)
          }
        })

        return {
          countryCode,
          totalUsers: userCount,
          fullfilledBatches: successfulBatches,
          failedBatches,
          errors,
        }
      },
    )

    const countriesResults = await Promise.allSettled(countriesPromises)
    const fulfilledCountriesResults = countriesResults.filter(
      countryResult => countryResult.status === 'fulfilled',
    )

    const jobIdsToMonitor: string[] = []
    fulfilledCountriesResults.forEach(countryResult => {
      countryResult.value.fullfilledBatches.forEach(batchResult => {
        if (batchResult.jobId) {
          jobIdsToMonitor.push(batchResult.jobId)
        }
      })
    })

    let sendgridJobResults: PromiseSettledResult<SendgridImportJobStatusResponse>[] = []
    if (jobIdsToMonitor.length > 0) {
      sendgridJobResults = await step.run('check-all-sendgrid-job-statuses', async () => {
        const statusPromises = jobIdsToMonitor.map(jobId => checkSendgridJobStatus(jobId))
        return await Promise.allSettled(statusPromises)
      })
    } else {
      logger.info('No SendGrid jobs were submitted; skipping status check phase.')
    }

    return {
      countriesResults,
      sendgridJobResults,
    }
  },
)
