import { literal, string, union } from 'zod'

import { normalizePhoneNumber, validatePhoneNumber } from '@/utils/shared/phoneNumber'

export const zodPhoneNumber = string()
  .refine(validatePhoneNumber, 'Please enter a valid phone number')
  .transform(normalizePhoneNumber)

export const zodOptionalEmptyPhoneNumber = union([zodPhoneNumber, literal('')])
