import chunk from 'lodash-es/chunk'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  getSendgridCustomFields,
  createSendgridCustomField,
  getContactFieldIds,
  SendgridCustomFields,
  FieldType,
  SendgridCustomField,
} from '@/utils/server/sendgrid/marketing/customFields'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getLogger } from '@/utils/shared/logger'

import { syncCountryContacts } from './logic'
import { NonRetriableError } from 'inngest'

export const SYNC_SENDGRID_CONTACTS_INNGEST_EVENT_NAME = 'script/sync-all-sendgrid-contacts-list'
export const SYNC_SENDGRID_CONTACTS_FUNCTION_ID = 'script.sync-all-sendgrid-contacts-list'

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

    await step.run('ensure-custom-fields-exist', async () => {
      logger.info('Checking and creating required custom fields in SendGrid')
      const fieldTypes: Record<SendgridCustomField, FieldType> = {
        signup_date: 'Date',
        completed_user_actions: 'Text',
        user_actions_count: 'Number',
        // session_id: 'Text',
      }

      const fieldDefinitions = await getSendgridCustomFields()
      const existingCustomFields = fieldDefinitions?.custom_fields?.map(field => field.name) || []

      logger.info(`Found ${existingCustomFields.length} existing custom fields`, {
        existingFields: existingCustomFields,
      })

      const fieldsToCreate = SendgridCustomFields.filter(
        fieldName => !existingCustomFields.includes(fieldName),
      )

      if (!fieldsToCreate.length) {
        logger.info('All required custom fields are set up')
        return {
          success: true,
          fieldIds: getContactFieldIds(fieldDefinitions),
        }
      }

      logger.info(`Need to create ${fieldsToCreate.length} custom fields`, {
        fieldsToCreate,
      })

      const fieldPromises = fieldsToCreate.map(fieldName => {
        const fieldType = fieldTypes[fieldName]
        logger.info(`Creating custom field: ${fieldName} (${fieldType})`)
        return {
          fieldName,
          promise: createSendgridCustomField(fieldName, fieldType),
        }
      })
      const results = await Promise.allSettled(fieldPromises.map(({ promise }) => promise))

      const creationResults = results.map((result, index) => {
        const { fieldName } = fieldPromises[index]
        if (result.status === 'fulfilled') {
          return {
            fieldName,
            status: 'success',
            data: result.value,
          }
        } else {
          return {
            fieldName,
            status: 'error',
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          }
        }
      })
      const successCount = creationResults.filter(r => r.status === 'success').length
      const failureCount = creationResults.filter(r => r.status === 'error').length
      logger.info(`Created ${successCount} fields, ${failureCount} failed`, {
        results: creationResults,
      })
      if (failureCount > 0) {
        const errors = creationResults
          .filter(r => r.status === 'error')
          .map(r => `Field ${r.fieldName}: ${r.error}`)
        logger.error(`Failed to create some custom fields: ${errors.join('; ')}`)
        throw new NonRetriableError(`Failed to create custom fields: ${errors.join('; ')}`)
      }
      return {
        success: true,
        message: `Created ${successCount} fields, ${failureCount} failed`,
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

    return {
      message: 'Completed syncing contacts to SendGrid',
      customFields: 'verified',
      results,
    }
  },
)
