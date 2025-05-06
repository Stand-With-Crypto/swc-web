import { NonRetriableError } from 'inngest'

import { checkCustomFields } from '@/inngest/functions/sendgridContactsCronJob/checkCustomFields'
import { checkSendgridJobStatus } from '@/inngest/functions/sendgridContactsCronJob/checkJobStatus'
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

const DB_QUERY_LIMIT = 100000

export type SyncSendgridContactsCoordinatorSchema = {
  name: typeof SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME
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
    const countries = ORDERED_SUPPORTED_COUNTRIES.filter(
      countryCode => countryCode !== SupportedCountryCodes.US,
    )

    const allResults: {
      countryCode: SupportedCountryCodes
      totalUsers: number
      batchesResults: {
        success: boolean
        jobId: string | null
      }[]
    }[] = []
    for (const countryCode of countries) {
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
        continue
      }

      logger.info(`Found ${userCount} users for country ${countryCode}`)
      const numDbChunks = Math.ceil(userCount / DB_QUERY_LIMIT)
      logger.info(
        `Processing ${countryCode} users in ${numDbChunks} DB chunks of up to ${DB_QUERY_LIMIT} users each`,
      )

      const countryPromises = []
      for (let chunkIndex = 0; chunkIndex < numDbChunks; chunkIndex++) {
        const take = DB_QUERY_LIMIT
        const skip = chunkIndex * DB_QUERY_LIMIT

        logger.info(
          `Fetching DB chunk ${chunkIndex + 1}/${numDbChunks} for ${countryCode}: skip=${skip}, take=${take}`,
        )

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
                  select: {
                    emailAddress: true,
                  },
                },
                userActions: {
                  select: {
                    actionType: true,
                    campaignName: true,
                  },
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
                  select: {
                    id: true,
                  },
                },
              },
              skip,
              take,
            })
          },
        )

        if (!users.length) {
          logger.warn(
            `DB chunk ${chunkIndex + 1}/${numDbChunks} for ${countryCode} returned no users. Stopping for this country.`,
          )
          break
        }

        countryPromises.push(
          step.invoke(`sync-${countryCode}-contacts-batch-${chunkIndex}`, {
            function: syncSendgridContactsProcessor,
            data: {
              countryCode,
              users,
            },
          }),
        )
      }

      const countryResults = await Promise.all(countryPromises)

      allResults.push({
        countryCode,
        totalUsers: userCount,
        batchesResults: countryResults,
      })
    }

    // Check sendgrid's job status
    const jobStatuses = await step.run('check-sendgrid-job-statuses', async () => {
      const promises: Promise<void>[] = []
      allResults.forEach(countryResult => {
        countryResult.batchesResults.forEach(({ jobId }) => {
          if (jobId) {
            promises.push(checkSendgridJobStatus(jobId))
          }
        })
      })
      return await Promise.all(promises)
    })

    return {
      message: 'Completed syncing contacts to SendGrid',
      customFields: 'verified',
      results: allResults,
    }
  },
)
