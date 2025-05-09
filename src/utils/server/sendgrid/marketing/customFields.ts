import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

/**
 * Sendgrid reserved fields. At least one of email or external_id is required.
 */
export const SENDGRID_RESERVED_FIELDS = [
  'external_id',
  'email',
  'first_name',
  'last_name',
  'address_line_1',
  'address_line_2',
  'city',
  'state_province_region',
  'country',
  'postal_code',
  'phone_number',
] as const
export type SendgridReservedField = (typeof SENDGRID_RESERVED_FIELDS)[number]

export type SendgridUserActionCustomField = `${UserActionType}_actions`
export function getSendgridUserActionCustomFieldName(
  actionType: UserActionType,
): SendgridUserActionCustomField {
  return `${actionType}_actions`
}

/**
 * Add new custom fields here.
 *
 * Note: SendGrid has a limit of 500 custom fields.
 */
export const SENDGRID_CUSTOM_FIELDS = [
  'signup_date',
  'user_actions_count',
  'session_id',
  ...Object.values(UserActionType).map(getSendgridUserActionCustomFieldName),
] as const
export type SendgridCustomField = (typeof SENDGRID_CUSTOM_FIELDS)[number]

export type SendgridField = SendgridReservedField | SendgridCustomField

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
