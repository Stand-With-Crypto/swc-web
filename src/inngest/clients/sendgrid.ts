import SendgridClient from '@sendgrid/client'
import * as XLSX from 'xlsx'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const SENDGRID_API_KEY = requiredOutsideLocalEnv(
  process.env.SENDGRID_API_KEY,
  'SENDGRID_API_KEY',
  'Sendgrid Email Sends',
)

if (SENDGRID_API_KEY) {
  SendgridClient.setApiKey(SENDGRID_API_KEY)
}

const SendgridReservedFields = [
  'external_id',
  'email',
  'first_name',
  'last_name',
  'address_line_1',
  // 'address_line_2',
  'city',
  'state_province_region',
  'postal_code',
  'country',
  'phone_number',
  // 'unique_name',
] as const
type SendgridReservedField = (typeof SendgridReservedFields)[number]

type SendgridCustomField = {
  signup_date: string
  user_actions_number: number
  user_actions: string[]
}

type SendgridField = SendgridReservedField | keyof SendgridCustomField

/**
 * Interface for SendGrid contact data
 */
type SendgridContact = Record<SendgridReservedField, string> & {
  custom_fields: SendgridCustomField
}

/**
 * Options for contact operations
 */
interface ContactOptions {
  subuser?: string
  listIds?: string[] // 57605191-e565-4189-9dd1-e37e4ac5fec8 (Test List 01)
  listNames?: string[]
}

/**
 * SendGrid API response interfaces
 */
interface GetListsResponse {
  result: {
    id: string
    name: string
    contact_count: number
  }[]
}

/**
 * Interface for the SendGrid Import Response
 */
interface SendgridImportResponse {
  job_id: string
  upload_uri: string
  upload_headers: Array<{ header: string; value: string }>
}

/**
 * Interface for field definitions
 */
interface FieldDefinitionsResponse {
  custom_fields: Array<{
    id: string
    name: string
    field_type: 'Text' | 'Number' | 'Date'
  }>
  reserved_fields: Array<{
    id: string
    name: string
    field_type: 'Text' | 'Number' | 'Date'
    read_only?: boolean
  }>
}

/**
 * SendGrid API client for managing contacts and emails
 */
export const sendgridClient = {
  /**
   * Get all field definitions
   */
  fields: {
    async getAll(options?: ContactOptions): Promise<FieldDefinitionsResponse> {
      try {
        const headers: Record<string, string> = {}
        if (options?.subuser) {
          // headers['on-behalf-of'] = options.subuser
        }

        const [response] = await SendgridClient.request({
          url: '/v3/marketing/field_definitions',
          method: 'GET',
          headers,
        })

        return response.body as FieldDefinitionsResponse
      } catch (error) {
        console.error('Error getting field definitions:', error)
        throw error
      }
    },
  },

  /**
   * Upsert (create or update) contacts in SendGrid
   */
  contacts: {
    /**
     * Upsert contacts via the PUT /v3/marketing/contacts endpoint
     * NOTE: This method only supports up to 30,000 contacts or 6MB of data, whichever is smaller.
     * For larger batches, use the upload() method instead.
     */
    async upsert(contacts: SendgridContact[], options?: ContactOptions) {
      if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not set')
      }

      try {
        // First, retrieve all field definitions to get the correct field IDs
        const sendgridFieldDefinitions = await sendgridClient.fields.getAll(options)

        // Find the field IDs for each field we want to use
        const findFieldId = (name: SendgridField) => {
          const isReserved = SendgridReservedFields.includes(name)
          const fields = isReserved
            ? sendgridFieldDefinitions.reserved_fields
            : sendgridFieldDefinitions.custom_fields

          const field = fields.find(f => f.name === name)
          return field?.id || null
        }

        // Find custom field IDs
        const signupDateFieldId = findFieldId('signup_date')
        const userActionsFieldId = findFieldId('user_actions')
        const userActionsNumberFieldId = findFieldId('user_actions_number')

        // Format contacts with custom fields in the correct format using field IDs
        const formattedContacts = contacts.map(contact => {
          const { custom_fields: contactCustomFields, ...standardFields } = contact

          const custom_fields: Record<string, any> = {}

          if (signupDateFieldId) {
            custom_fields[signupDateFieldId] = contactCustomFields.signup_date
          }

          if (userActionsNumberFieldId) {
            custom_fields[userActionsNumberFieldId] = contactCustomFields.user_actions_number
          }

          if (userActionsFieldId) {
            custom_fields[userActionsFieldId] = contactCustomFields.user_actions.join(';')
          }

          // Return formatted contact with custom_fields object
          return {
            ...standardFields,
            custom_fields,
          }
        })

        console.log('DATA', {
          formattedContacts: formattedContacts[0].custom_fields,
          userActionsFieldId,
          userActionsNumberFieldId,
          signupDateFieldId,
        })

        let listIds: string[] = []
        if (options?.listNames) {
          listIds = await Promise.all(
            options.listNames.map(name => sendgridClient.contacts.getOrCreateList(name, options)),
          ).then(ids => ids.filter(Boolean))
        } else if (options?.listIds) {
          listIds = options.listIds
        }

        const data = {
          list_ids: listIds,
          contacts: formattedContacts,
        }

        const request = {
          url: '/v3/marketing/contacts',
          method: 'PUT' as const,
          body: data,
          // headers: {
          //   authorization: `Bearer ${SENDGRID_API_KEY}`,
          // },
        }

        // If using a subuser, add the on-behalf-of header
        const headers: Record<string, string> = {}
        if (options?.subuser) {
          // headers['on-behalf-of'] = options.subuser
        }

        const [response] = await SendgridClient.request({
          ...request,
          headers,
        })
        return response.body
      } catch (error) {
        console.error('Error upserting contacts:', {
          error,
          message: error?.toString(),
        })
        throw error
      }
    },

    /**
     * Upload contacts via CSV import
     * NOTE: This method supports up to 1,000,000 contacts or 5GB of data, whichever is smaller.
     * It's more efficient for large batches than the upsert() method.
     */
    async upload(contacts: SendgridContact[], options?: ContactOptions) {
      if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not set')
      }

      try {
        // First, retrieve all field definitions to get the correct field IDs
        const sendgridFieldDefinitions = await sendgridClient.fields.getAll(options)

        // Find the field IDs for each field we want to use
        const findFieldId = (name: SendgridField): string | null => {
          const isReserved = SendgridReservedFields.includes(name)
          const fields = isReserved
            ? sendgridFieldDefinitions.reserved_fields
            : sendgridFieldDefinitions.custom_fields

          const field = fields.find(f => f.name === name)
          return field?.id || null
        }

        // Find the reserved field IDs
        const emailFieldId = findFieldId('email')
        const firstNameFieldId = findFieldId('first_name')
        const lastNameFieldId = findFieldId('last_name')
        const countryFieldId = findFieldId('country')
        const addressLine1FieldId = findFieldId('address_line_1')
        const cityFieldId = findFieldId('city')
        const stateFieldId = findFieldId('state_province_region')
        const postalCodeFieldId = findFieldId('postal_code')
        const phoneNumberFieldId = findFieldId('phone_number')

        // Create or find custom field IDs
        const signupDateFieldId = findFieldId('signup_date')
        const userActionsFieldId = findFieldId('user_actions')
        const userActionsNumberFieldId = findFieldId('user_actions_number')

        if (!emailFieldId) {
          throw new Error('Required email field not found in SendGrid')
        }

        const fieldMappings = [
          emailFieldId,
          firstNameFieldId,
          lastNameFieldId,
          countryFieldId,
          addressLine1FieldId,
          cityFieldId,
          stateFieldId,
          postalCodeFieldId,
          phoneNumberFieldId,
          signupDateFieldId,
          userActionsFieldId,
          userActionsNumberFieldId,
        ]

        // Step 1: Request upload URL and headers
        const [response] = await SendgridClient.request({
          url: '/v3/marketing/contacts/imports',
          method: 'PUT',
          body: {
            file_type: 'csv',
            field_mappings: fieldMappings,
            list_ids: options?.listIds || [],
          },
          headers: {
            authorization: `Bearer ${SENDGRID_API_KEY}`,
            // ...(options?.subuser ? { 'on-behalf-of': options.subuser } : {}),
          },
        })

        // Type assertion for the response body
        const responseBody = response.body as SendgridImportResponse

        // Step 2: Generate CSV content with xlsx

        // Prepare data for the worksheet
        const csvData = contacts.map(contact => {
          return {
            ...contact,
            user_actions: contact.user_actions.join(';'),
          }
        })

        // Create worksheet from data (with specific columns in the right order)
        const worksheet = XLSX.utils.json_to_sheet(csvData, {
          header: fieldMappings.map(field => field || ''),
        })

        // Convert the worksheet to CSV
        const csvContent = XLSX.utils.sheet_to_csv(worksheet)

        // Step 3: Upload the CSV to the provided URL
        const { upload_uri, upload_headers } = responseBody

        // Create fetch options with the provided headers
        const headers: Record<string, string> = {}
        upload_headers.forEach((h: { header: string; value: string }) => {
          headers[h.header] = h.value
        })

        // Upload the CSV
        const uploadResponse = await fetch(upload_uri, {
          method: 'PUT',
          headers,
          body: csvContent,
        })

        if (!uploadResponse.ok) {
          throw new Error(`CSV upload failed: ${uploadResponse.statusText}`)
        }

        return {
          success: true,
          job_id: responseBody.job_id,
          count: contacts.length,
        }
      } catch (error) {
        console.error('Error importing contacts via CSV:', error)
        throw error
      }
    },

    /**
     * Create or retrieve a list by name
     */
    async getOrCreateList(name: string, options?: ContactOptions) {
      if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not set')
      }

      // First check if list exists
      try {
        const [listsResponse] = await SendgridClient.request({
          url: `/v3/marketing/lists`,
          method: 'GET',
          headers: {
            authorization: `Bearer ${SENDGRID_API_KEY}`,
            // ...(options?.subuser ? { 'on-behalf-of': options.subuser } : {}),
          },
        })

        // Type assertion for the response body
        const lists = (listsResponse.body as GetListsResponse).result
        const existingList = lists.find(list => list.name === name)

        if (existingList) {
          return existingList.id
        }

        // Create a new list if it doesn't exist
        const [createResponse] = await SendgridClient.request({
          url: '/v3/marketing/lists',
          method: 'POST',
          body: {
            name: name,
          },
          headers: {
            authorization: `Bearer ${SENDGRID_API_KEY}`,
            // ...(options?.subuser ? { 'on-behalf-of': options.subuser } : {}),
          },
        })

        return (createResponse.body as { id: string }).id
      } catch (error) {
        console.error('Error creating/retrieving list:', error)
        throw error
      }
    },
  },
}
