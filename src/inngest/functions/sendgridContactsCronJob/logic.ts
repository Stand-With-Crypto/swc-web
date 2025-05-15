import { UserActionType } from '@prisma/client'

import {
  SENDGRID_CONTACTS_API_LIMIT,
  SIX_MB_IN_BYTES,
} from '@/inngest/functions/sendgridContactsCronJob/config'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import {
  SendgridContact,
  upsertSendgridContactsArray,
} from '@/utils/server/sendgrid/marketing/contacts'
import {
  getSendgridUserActionCustomFieldName,
  SendgridUserActionCustomField,
} from '@/utils/server/sendgrid/marketing/customFields'
import {
  fetchSendgridContactList,
  getSendgridContactListName,
} from '@/utils/server/sendgrid/marketing/lists'
import { uploadSendgridContactsCSV } from '@/utils/server/sendgrid/marketing/uploadCSV'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const SYNC_SENDGRID_CONTACTS_PROCESSOR_EVENT_NAME = 'script/sync-sendgrid-contacts-processor'
const SYNC_SENDGRID_CONTACTS_PROCESSOR_FUNCTION_ID = 'script.sync-sendgrid-contacts-processor'

interface User {
  id: string
  primaryUserEmailAddress?: {
    emailAddress: string
  } | null
  userActions: {
    actionType: string
    campaignName: string
  }[]
  address?: {
    formattedDescription: string | null
    locality: string | null
    administrativeAreaLevel1: string | null
    postalCode: string | null
  } | null
  phoneNumber: string | null
  firstName: string | null
  lastName: string | null
  countryCode: string
  datetimeCreated: Date | string
  userSessions: {
    id: string
  }[]
}

export interface SyncSendgridContactsProcessorSchema {
  name: typeof SYNC_SENDGRID_CONTACTS_PROCESSOR_EVENT_NAME
  data: {
    countryCode: SupportedCountryCodes
    users: User[]
  }
}

export const syncSendgridContactsProcessor = inngest.createFunction(
  { id: SYNC_SENDGRID_CONTACTS_PROCESSOR_FUNCTION_ID, onFailure: onScriptFailure, concurrency: 10 },
  { event: SYNC_SENDGRID_CONTACTS_PROCESSOR_EVENT_NAME },
  async ({ event, step, logger }) => {
    const { countryCode, users } = event.data

    const listId = await step.run(`get-${countryCode}-contact-list-id`, async () => {
      const list = await fetchSendgridContactList(getSendgridContactListName(countryCode))
      return list.id
    })

    return await step.run(`sync-${countryCode}-contacts`, async () => {
      try {
        const contacts = users.map(user => {
          const email = user.primaryUserEmailAddress?.emailAddress || ''
          const completedUsersActionsCustomFields: Record<SendgridUserActionCustomField, string> =
            Object.values(UserActionType).reduce(
              (acc, actionType) => {
                const customFieldName = getSendgridUserActionCustomFieldName(actionType)
                acc[customFieldName] = user.userActions
                  .filter(action => action.actionType === actionType)
                  .map(action => action.campaignName)
                  .join(',')
                return acc
              },
              {} as Record<SendgridUserActionCustomField, string>,
            )

          return {
            email,
            external_id: user.id,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            country: user.countryCode,
            address_line_1: user.address?.formattedDescription?.slice(0, 100) || '',
            address_line_2: '',
            city: user.address?.locality || '',
            state_province_region: user.address?.administrativeAreaLevel1 || '',
            postal_code: user.address?.postalCode || '',
            phone_number: user.phoneNumber || '',
            custom_fields: {
              signup_date:
                user.datetimeCreated instanceof Date
                  ? user.datetimeCreated.toISOString()
                  : user.datetimeCreated,
              user_actions_count: user.userActions.length,
              session_id: user.userSessions?.[0]?.id || '',
              ...completedUsersActionsCustomFields,
            },
          } satisfies SendgridContact
        })

        const validContacts = contacts.filter(contact => !!contact.email)

        if (validContacts.length === 0) {
          return {
            success: true,
            validContactsCount: 0,
            jobId: null,
            method: 'no-contacts',
          }
        }

        /**
         * SendGrid has a limit of 30,000 contacts per batch or 6MB of data, whichever is smaller.
         * The CSV upload limit is 1,000,000 contacts or 5GB of data, whichever is smaller.
         */
        const contactsDataSize = Buffer.from(JSON.stringify(validContacts), 'utf-8').length
        if (
          validContacts.length > SENDGRID_CONTACTS_API_LIMIT ||
          contactsDataSize > SIX_MB_IN_BYTES
        ) {
          const uploadResult = await uploadSendgridContactsCSV(validContacts, {
            listIds: [listId],
          })
          return {
            success: uploadResult.success,
            validContactsCount: validContacts.length,
            jobId: uploadResult.job_id,
            method: 'csv-upload',
          }
        } else {
          const upsertResult = await upsertSendgridContactsArray(validContacts, {
            listIds: [listId],
          })
          return {
            success: true,
            validContactsCount: validContacts.length,
            jobId: upsertResult.job_id,
            method: 'upsert',
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error(`Error syncing ${countryCode} contacts:`, errorMessage)
        return {
          success: false,
          jobId: null,
          usersCount: users.length,
          error: errorMessage,
        }
      }
    })
  },
)
