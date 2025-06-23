import * as Sentry from '@sentry/nextjs'
import * as XLSX from 'xlsx'

import {
  SENDGRID_CUSTOM_FIELDS,
  SENDGRID_RESERVED_FIELDS,
  SendgridField,
} from '@/utils/server/sendgrid/marketing/constants'
import { SendgridContact } from '@/utils/server/sendgrid/marketing/contacts'
import { isSendgridError } from '@/utils/server/sendgrid/marketing/utils'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'
import { fetchReq } from '@/utils/shared/fetchReq'

interface SendgridImportResponse {
  body: {
    job_id: string
    upload_uri: string
    upload_headers: Array<{ header: string; value: string }>
  }
}

interface Options {
  listIds: string[]
  customFieldsMap: Record<SendgridField, string | null>
}

async function getCSVHeaders(customFieldsMap: Record<SendgridField, string | null>) {
  if (!customFieldsMap.email) {
    throw new Error('Required email field ID not found in SendGrid')
  }

  const allFieldNames: SendgridField[] = [...SENDGRID_RESERVED_FIELDS, ...SENDGRID_CUSTOM_FIELDS]
  const csvSheetHeaders: string[] = []
  const sendgridApiMappings: string[] = []
  allFieldNames.forEach(fieldName => {
    const fieldId = customFieldsMap[fieldName]
    if (fieldId) {
      csvSheetHeaders.push(fieldName)
      sendgridApiMappings.push(fieldId)
    } else {
      Sentry.captureMessage(`Custom field ${fieldName} not found in SendGrid definitions`, {
        tags: {
          domain: 'SendgridMarketing',
        },
        extra: {
          fieldName,
          customFieldsMap,
        },
      })
    }
  })

  if (csvSheetHeaders.length === 0) {
    throw new Error('No valid field mappings found for CSV export.')
  }

  return { csvSheetHeaders, sendgridApiMappings }
}

async function getUploadUrl(sendgridApiMappings: string[], listIds: string[]) {
  const [response] = (await SendgridClient.request({
    url: '/v3/marketing/contacts/imports',
    method: 'PUT',
    body: {
      file_type: 'csv',
      field_mappings: sendgridApiMappings,
      list_ids: listIds,
    },
  })) as [SendgridImportResponse, unknown]
  return response.body
}

function formatContactsForCSV(contacts: SendgridContact[]) {
  // Flatten the custom_fields for the CSV
  const flattenedContactsData = contacts.map(contact => {
    const { custom_fields, ...standardFields } = contact
    return {
      ...standardFields,
      ...custom_fields,
    }
  })
  return flattenedContactsData
}

export async function uploadSendgridContactsCSV(contacts: SendgridContact[], options: Options) {
  const { listIds, customFieldsMap } = options

  try {
    const { csvSheetHeaders, sendgridApiMappings } = await getCSVHeaders(customFieldsMap)
    const formattedContacts = formatContactsForCSV(contacts)
    const worksheet = XLSX.utils.json_to_sheet(formattedContacts, {
      header: csvSheetHeaders,
    })
    const csvContent = XLSX.utils.sheet_to_csv(worksheet)

    const { upload_uri, upload_headers, job_id } = await getUploadUrl(
      sendgridApiMappings,
      listIds || [],
    )
    const uploadResponse = await fetchReq(upload_uri, {
      method: 'PUT',
      body: csvContent,
      headers: upload_headers.map(h => [h.header, h.value] as [string, string]),
    })
    if (!uploadResponse.ok) {
      throw new Error(`CSV upload failed: ${uploadResponse.statusText}`)
    }

    return {
      success: true,
      job_id,
      count: formattedContacts.length,
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
