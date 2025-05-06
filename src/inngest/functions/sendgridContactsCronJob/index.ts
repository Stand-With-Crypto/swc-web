import chunk from 'lodash-es/chunk'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

import { NonRetriableError } from 'inngest'
import { syncSendgridContactsProcessor } from './logic'
import { checkCustomFields } from '@/inngest/functions/sendgridContactsCronJob/checkCustomFields'

export const SYNC_SENDGRID_CONTACTS_COORDINATOR_INNGEST_EVENT_NAME =
  'script/sync-sendgrid-contacts-coordinator'
export const SYNC_SENDGRID_CONTACTS_COORDINATOR_FUNCTION_ID =
  'script.sync-sendgrid-contacts-coordinator'

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
        throw new NonRetriableError('Custom Fields check failed')
      }
    })

    // Skip US for now
    const countries = ORDERED_SUPPORTED_COUNTRIES.filter(
      countryCode => countryCode !== SupportedCountryCodes.US,
    )

    const results = []
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
            userSessions: {
              select: {
                id: true,
              },
            },
          },
        })
      })

      if (!users.length) {
        logger.info(`No users found for country code ${countryCode}, skipping.`)
        continue
      }

      logger.info(`Processing ${users.length} users for country ${countryCode}`)

      const promises = []
      promises.push(
        step.invoke(`sync-${countryCode}-contacts`, {
          function: syncSendgridContactsProcessor,
          data: {
            countryCode,
            users,
          },
        }),
      )

      const countryResults = await Promise.all(promises)

      results.push({
        countryCode,
        totalUsers: users.length,
        results: countryResults,
      })
    }

    return {
      message: 'Completed syncing contacts to SendGrid',
      customFields: 'verified',
      results,
    }
  },
)
