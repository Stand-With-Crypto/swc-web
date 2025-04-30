import chunk from 'lodash-es/chunk'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getLogger } from '@/utils/shared/logger'

import { syncCountryContacts } from './logic'

export const SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME = 'cron/sync-sendgrid-contacts'
export const SYNC_SENDGRID_CONTACTS_FUNCTION_ID = 'cron.sync-sendgrid-contacts'

const BATCH_SIZE = 5000

export type SyncSendgridContactsCronJobSchema = {
  name: typeof SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME
  data?: Record<string, never>
}

export const syncSendgridContacts = inngest.createFunction(
  { id: SYNC_SENDGRID_CONTACTS_FUNCTION_ID, onFailure: onScriptFailure },
  { event: SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME },
  async ({ step }) => {
    const logger = getLogger('sync-sendgrid-contacts')
    const results = []
    // Skip US for now
    const countries = ORDERED_SUPPORTED_COUNTRIES.filter(
      countryCode => countryCode !== SupportedCountryCodes.US,
    )

    for (const countryCode of countries) {
      const users = await step.run(`fetch-${countryCode}-users`, async () => {
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
          },
        })
      })

      if (!users.length) {
        logger.info(`No users found for country code ${countryCode}, skipping.`)
        continue
      }

      const userBatches = chunk(users, BATCH_SIZE)
      logger.info(
        `Processing ${users.length} users for country ${countryCode} in ${userBatches.length} batches`,
      )

      const countryResults = []
      for (const [batchIndex, userBatch] of userBatches.entries()) {
        const result = await step.invoke(`sync-${countryCode}-contacts-batch-${batchIndex + 1}`, {
          function: syncCountryContacts,
          data: {
            countryCode,
            users: userBatch,
          },
        })
        countryResults.push(result)
      }

      results.push({
        countryCode,
        totalUsers: users.length,
        batches: userBatches.length,
        results: countryResults,
      })
    }

    return results
  },
)
