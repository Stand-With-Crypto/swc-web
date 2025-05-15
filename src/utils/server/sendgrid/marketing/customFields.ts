import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import {
  SENDGRID_CUSTOM_FIELDS,
  SENDGRID_RESERVED_FIELDS,
  SendgridField,
} from '@/utils/server/sendgrid/marketing/constants'
import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

export type SendgridUserActionCustomField = `${UserActionType}_actions`
export function getSendgridUserActionCustomFieldName(
  actionType: UserActionType,
): SendgridUserActionCustomField {
  return `${actionType}_actions`
}

/**
 * Sendgrid supported field types.
 */
export type FieldType = 'Text' | 'Number' | 'Date'
interface FieldDefinitionsResponse {
  custom_fields?: Array<{
    id: string
    name: string
    field_type: FieldType
  }>
  reserved_fields: Array<{
    id: string
    name: string
    field_type: FieldType
    read_only?: boolean
  }>
}

export const fetchSendgridCustomFields = async () => {
  try {
    const [response] = await SendgridClient.request({
      url: '/v3/marketing/field_definitions',
      method: 'GET',
    })
    return response.body as FieldDefinitionsResponse
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
      },
    })
    throw error
  }
}

interface CreateCustomFieldResponse {
  id: string
  name: string
  field_type: FieldType
}

export const createSendgridCustomField = async (name: string, fieldType: FieldType) => {
  try {
    const [response] = await SendgridClient.request({
      url: '/v3/marketing/field_definitions',
      method: 'POST',
      body: {
        name,
        field_type: fieldType,
      },
    })
    return response.body as CreateCustomFieldResponse
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'SendgridMarketing',
      },
      extra: {
        name,
        fieldType,
      },
    })
    throw error
  }
}

export function mapSendgridFieldToFieldIds(fieldDefinitions: FieldDefinitionsResponse) {
  const allFields: SendgridField[] = [...SENDGRID_RESERVED_FIELDS, ...SENDGRID_CUSTOM_FIELDS]
  return allFields.reduce(
    (acc, fieldName) => {
      const isReserved = SENDGRID_RESERVED_FIELDS.includes(fieldName)
      const fields = isReserved ? fieldDefinitions.reserved_fields : fieldDefinitions.custom_fields
      const field = fields?.find(f => f.name === fieldName)
      acc[fieldName] = field?.id || null
      return acc
    },
    {} as Record<SendgridField, string | null>,
  )
}
