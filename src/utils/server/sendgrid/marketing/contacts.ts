import * as Sentry from '@sentry/nextjs'
import * as XLSX from 'xlsx'

import {
  fetchSendgridCustomFields,
  mapSendgridFieldToFieldIds,
  SENDGRID_CUSTOM_FIELDS,
  SENDGRID_RESERVED_FIELDS,
  SendgridCustomField,
  SendgridField,
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

  try {
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

    if (isSendgridError(error)) {
      throw new Error(JSON.stringify(error.response.body, null, 2))
    }

    throw error
  }
}

interface SendgridImportResponse {
  job_id: string
  upload_uri: string
  upload_headers: Array<{ header: string; value: string }>
}

export async function uploadSendgridContactsCSV(contacts: SendgridContact[], options?: Options) {
  try {
    const sendgridFieldDefinitions = await fetchSendgridCustomFields()
    const fieldIds = mapSendgridFieldToFieldIds(sendgridFieldDefinitions)

    if (!fieldIds.email) {
      throw new Error('Required email field not found in SendGrid')
    }

    // Flatten the custom_fields for the CSV
    const flattenedContactsData = contacts.map(contact => {
      const { custom_fields, ...standardFields } = contact
      return {
        ...standardFields,
        ...custom_fields,
      }
    })

    const allFieldNames: SendgridField[] = [...SENDGRID_RESERVED_FIELDS, ...SENDGRID_CUSTOM_FIELDS]

    const csvSheetHeaders: string[] = []
    const sendgridApiMappings: string[] = []
    allFieldNames.forEach(fieldName => {
      const fieldId = fieldIds[fieldName]
      if (fieldId) {
        csvSheetHeaders.push(fieldName)
        sendgridApiMappings.push(fieldId)
      }
    })

    if (csvSheetHeaders.length === 0) {
      throw new Error('No valid field mappings found for CSV export.')
    }

    const [response] = await SendgridClient.request({
      url: '/v3/marketing/contacts/imports',
      method: 'PUT',
      body: {
        file_type: 'csv',
        field_mappings: sendgridApiMappings,
        list_ids: options?.listIds || [],
      },
    })
    const responseBody = response.body as SendgridImportResponse
    const { upload_uri, upload_headers } = responseBody

    const worksheet = XLSX.utils.json_to_sheet(flattenedContactsData, {
      header: csvSheetHeaders,
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
      count: flattenedContactsData.length,
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

    if (isSendgridError(error)) {
      throw new Error(JSON.stringify(error.response.body, null, 2))
    }

    throw error
  }
}

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T]
function typedObjectEntries<T extends object>(object: T): Entries<T>[] {
  return Object.entries(object) as Entries<T>[]
}

interface SendgridContactsError {
  message: string
  code: number
  response: {
    body: {
      errors: {
        field: string
        message: string
      }[]
    }
  }
}
function isSendgridError(error: unknown): error is SendgridContactsError {
  if (typeof error !== 'object' || error === null) {
    return false
  }
  const err = error as Record<string, any>

  return (
    typeof err.message === 'string' &&
    typeof err.code === 'number' &&
    typeof err.response === 'object' &&
    err.response !== null &&
    typeof err.response.body === 'object' &&
    err.response.body !== null &&
    Array.isArray(err.response.body.errors)
  )
}
