import { inngest } from '@/inngest/inngest'
import { prismaClient } from '@/utils/server/prismaClient'
import {
  uploadSendgridContactsCSV,
  upsertSendgridContactsArray,
} from '@/utils/server/sendgrid/marketing/contacts'
import {
  getSendgridContactList,
  getSendgridContactListName,
} from '@/utils/server/sendgrid/marketing/lists'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SYNC_COUNTRY_CONTACTS_EVENT_NAME = 'script/sync-country-contacts'
const SYNC_COUNTRY_CONTACTS_FUNCTION_ID = 'script.sync-country-contacts'

export type SyncCountryContactsParams = {
  countryCode: SupportedCountryCodes
}

export type SyncCountryContactsSchema = {
  name: typeof SYNC_COUNTRY_CONTACTS_EVENT_NAME
  data: SyncCountryContactsParams
}

export const syncCountryContacts = inngest.createFunction(
  { id: SYNC_COUNTRY_CONTACTS_FUNCTION_ID },
  { event: SYNC_COUNTRY_CONTACTS_EVENT_NAME },
  async ({ event, step }) => {
    const { countryCode } = event.data

    const listId = await step.run(`get-${countryCode}-list-id`, async () => {
      const listName = getSendgridContactListName(countryCode)
      const list = await getSendgridContactList(listName)
      return list.id
    })

    const users = await step.run(`query-${countryCode}-users`, async () => {
      return prismaClient.user.findMany({
        where: {
          countryCode,
          // primaryUserEmailAddressId: { not: null },
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

    return await step.run(`sync-${countryCode}-contacts-impl`, async () => {
      try {
        // Format users for SendGrid - map DB fields to SendGrid fields
        const contacts = users.map(user => {
          const email = user.primaryUserEmailAddress?.emailAddress || ''
          const userActions = user.userActions
            .map(action => `${action.actionType}-${action.campaignName}`)
            .join(';')

          return {
            external_id: user.id,
            email,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            country: user.countryCode,
            address_line_1: user.address?.formattedDescription || '',
            city: user.address?.locality || '',
            state_province_region: user.address?.administrativeAreaLevel1 || '',
            postal_code: user.address?.postalCode || '',
            phone_number: user.phoneNumber || '',
            // Custom fields
            custom_fields: {
              signup_date: user.datetimeCreated,
              completed_user_actions: userActions,
              user_actions_count: userActions.length.toString(),
            },
          }
        })

        // Filter out any contacts without email addresses
        // const validContacts = contacts.filter(contact => !!contact.email)
        const validContacts = contacts

        // Skip if no valid contacts
        if (validContacts.length === 0) {
          return {
            success: true,
            count: 0,
            method: 'no-contacts',
          }
        }

        // Determine whether to use CSV upload or upsert based on contact count
        if (validContacts.length > 20000) {
          // For large batches, use the more efficient CSV upload
          const uploadResult = await uploadSendgridContactsCSV(validContacts, {
            listIds: [listId],
          })
          return {
            success: true,
            count: validContacts.length,
            job_id: uploadResult.job_id,
            method: 'csv-upload',
          }
        } else {
          // For smaller batches, use the standard upsert method
          await upsertSendgridContactsArray(validContacts, {
            listIds: [listId],
          })
          return {
            success: true,
            count: validContacts.length,
            method: 'upsert',
          }
        }
      } catch (error) {
        console.error(`Error syncing ${countryCode} contacts:`, error)
        return {
          success: false,
          count: users.length,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })
  },
)
