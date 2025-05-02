import * as Sentry from '@sentry/nextjs'
import * as XLSX from 'xlsx'

import {
  getContactFieldIds,
  getSendgridCustomFields,
  SendgridCustomField,
  SendgridReservedField,
} from '@/utils/server/sendgrid/marketing/customFields'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

export type SendgridContact = Record<SendgridReservedField, string> & {
  custom_fields: Record<SendgridCustomField, string>
}

interface Options {
  listIds: string[]
}

export const upsertSendgridContactsArray = async (
  contacts: SendgridContact[],
  options: Options,
) => {
  try {
    const sendgridFieldDefinitions = await getSendgridCustomFields()
    const fieldIds = getContactFieldIds(sendgridFieldDefinitions)

    // TODO: improve type safety.
    // An if case for each field wont allow for dynamic fields scalability (every new field will require an update here)
    const formattedContacts = contacts.map(contact => {
      const { custom_fields: contactCustomFields, ...standardFields } = contact
      const custom_fields: Record<string, string> = {}
      if (fieldIds.signup_date) {
        custom_fields[fieldIds.signup_date] = contactCustomFields.signup_date
      }
      if (fieldIds.user_actions_count) {
        custom_fields[fieldIds.user_actions_count] = contactCustomFields.user_actions_count
      }
      if (fieldIds.completed_user_actions) {
        custom_fields[fieldIds.completed_user_actions] = contactCustomFields.completed_user_actions
      }
      // if (fieldIds.session_id) {
      //   custom_fields[fieldIds.session_id] = contactCustomFields.session_id
      // }
      return {
        ...standardFields,
        custom_fields,
      }
    })

    const data = {
      list_ids: options.listIds,
      contacts: formattedContacts,
    }

    const request = {
      url: '/v3/marketing/contacts',
      method: 'PUT' as const,
      body: data,
    }
    const [response] = await SendgridClient.request(request)
    console.log('UPSERT RESPONSE:', response.body)
    return response.body
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'sendgridClient.contacts.upsert',
      },
      extra: {
        contacts: contacts.slice(0, 3),
        options,
      },
    })
    throw error
  }
}

interface SendgridImportResponse {
  job_id: string
  upload_uri: string
  upload_headers: Array<{ header: string; value: string }>
}

export async function uploadSendgridContactsCSV(
  /**
   * TODO: This typing should not have a `custom_fields` property.
   * Even though it works, it ends up adding an extra column to the CSV file.
   */
  contacts: SendgridContact[],
  options?: Options,
) {
  try {
    const sendgridFieldDefinitions = await getSendgridCustomFields()
    const fieldIds = getContactFieldIds(sendgridFieldDefinitions)

    if (!fieldIds.email) {
      throw new Error('Required email field not found in SendGrid')
    }

    const fieldMappings = [
      fieldIds.email,
      fieldIds.first_name,
      fieldIds.last_name,
      fieldIds.country,
      fieldIds.address_line_1,
      fieldIds.city,
      fieldIds.state_province_region,
      fieldIds.postal_code,
      fieldIds.phone_number,
      fieldIds.signup_date,
      fieldIds.completed_user_actions,
      fieldIds.user_actions_count,
    ]

    const [response] = await SendgridClient.request({
      url: '/v3/marketing/contacts/imports',
      method: 'PUT',
      body: {
        file_type: 'csv',
        field_mappings: fieldMappings,
        list_ids: options?.listIds || [],
      },
    })
    const responseBody = response.body as SendgridImportResponse
    const { upload_uri, upload_headers } = responseBody

    const worksheet = XLSX.utils.json_to_sheet(contacts, {
      header: fieldMappings.map(field => field || ''),
    })
    const csvContent = XLSX.utils.sheet_to_csv(worksheet)

    const headers: Record<string, string> = {}
    upload_headers.forEach((h: { header: string; value: string }) => {
      headers[h.header] = h.value
    })
    const uploadResponse = await fetch(upload_uri, {
      method: 'PUT',
      body: csvContent,
      headers,
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
    Sentry.captureException(error, {
      tags: {
        domain: 'sendgridClient.contacts.upload',
      },
      extra: {
        contacts: contacts.slice(0, 3),
        options,
      },
    })
    throw error
  }
}
