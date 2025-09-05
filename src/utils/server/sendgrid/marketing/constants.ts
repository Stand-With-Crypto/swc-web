import { UserActionType } from '@prisma/client'

import { getSendgridUserActionCustomFieldName } from '@/utils/server/sendgrid/marketing/customFields'

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

/**
 * Add new custom fields here.
 *
 * Note: SendGrid has a limit of 500 custom fields.
 */
export const SENDGRID_CUSTOM_FIELDS = [
  'signup_date',
  'user_actions_count',
  'session_id',
  'aquisition_source',
  'aquisition_medium',
  'aquisition_campaign',
  'aquisition_referer',
  ...Object.values(UserActionType).map(getSendgridUserActionCustomFieldName),
] as const
export type SendgridCustomField = (typeof SENDGRID_CUSTOM_FIELDS)[number]

export type SendgridField = SendgridReservedField | SendgridCustomField
