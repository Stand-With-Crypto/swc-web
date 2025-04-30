import * as Sentry from '@sentry/nextjs'

import { SendgridClient } from '@/utils/server/sendgrid/sendgridClient'

export const SendgridReservedFields = [
  'external_id',
  'email',
  'first_name',
  'last_name',
  'address_line_1',
  'city',
  'state_province_region',
  'postal_code',
  'country',
  'phone_number',
] as const
export type SendgridReservedField = (typeof SendgridReservedFields)[number]

export const SendgridCustomFields = [
  'signup_date',
  'completed_user_actions',
  'user_actions_count',
] as const
export type SendgridCustomField = (typeof SendgridCustomFields)[number]

export type SendgridField = SendgridReservedField | SendgridCustomField

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

export const getSendgridCustomFields = async () => {
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

export function getContactFieldIds(fieldDefinitions: FieldDefinitionsResponse) {
  const allFields: SendgridField[] = [...SendgridReservedFields, ...SendgridCustomFields]
  return allFields.reduce(
    (acc, fieldName) => {
      const isReserved = SendgridReservedFields.includes(fieldName)
      const fields = isReserved ? fieldDefinitions.reserved_fields : fieldDefinitions.custom_fields
      const field = fields.find(f => f.name === fieldName)
      acc[fieldName] = field?.id || null
      return acc
    },
    {} as Record<SendgridField, string | null>,
  )
}
