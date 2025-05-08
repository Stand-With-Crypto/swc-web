import * as Sentry from '@sentry/nextjs'
import * as XLSX from 'xlsx'

import {
  fetchSendgridCustomFields,
  mapSendgridFieldToFieldIds,
  SendgridCustomField,
  SendgridReservedField,
} from '@/utils/server/sendgrid/marketing/customFields'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

export type SendgridContact = Record<SendgridReservedField, string> & {
  custom_fields: Record<SendgridCustomField, string | number>
}

interface Options {
  listIds: string[]
}

export const upsertSendgridContactsArray = async (
  contacts: SendgridContact[],
  options: Options,
) => {
  try {
    const sendgridFieldDefinitions = await fetchSendgridCustomFields()
    const fieldIds = mapSendgridFieldToFieldIds(sendgridFieldDefinitions)

    // Map custom fields to their respective Sendgrid ID
    const formattedContacts = contacts.map(contact => {
      const { custom_fields, ...standardFields } = contact
      const customFieldsMappedToIds: Record<string, string | number> = {}

      typedObjectEntries(custom_fields).forEach(([fieldName, fieldValue]) => {
        const fieldId = fieldIds[fieldName]
        if (fieldId) {
          customFieldsMappedToIds[fieldId] = fieldValue
        } else {
          Sentry.captureMessage(`Custom field ${fieldName} not found in SendGrid definitions`, {
            tags: {
              domain: 'SendgridMarketing',
            },
            extra: {
              fieldName,
              fieldValue,
              sendgridFieldDefinitions,
            },
          })
        }
      })

      return {
        ...standardFields,
        custom_fields: customFieldsMappedToIds,
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
    return response.body as { job_id: string }
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
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
   * Even though it works (xlsx flattens the custom_fields), it ends up adding an extra column to the CSV file.
   */
  contacts: SendgridContact[],
  options?: Options,
) {
  try {
    const sendgridFieldDefinitions = await fetchSendgridCustomFields()
    const fieldIds = mapSendgridFieldToFieldIds(sendgridFieldDefinitions)

    if (!fieldIds.email) {
      throw new Error('Required email field not found in SendGrid')
    }

    // TODO: Make this dynamic/programmatic
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
        domain: 'SendgridMarketing',
      },
      extra: {
        contacts: contacts.slice(0, 3),
        options,
      },
    })
    throw error
  }
}

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T]
function typedObjectEntries<T extends object>(object: T): Entries<T>[] {
  return Object.entries(object) as Entries<T>[]
}
