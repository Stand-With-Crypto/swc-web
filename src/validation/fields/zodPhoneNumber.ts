import { literal, string, union } from 'zod'

import { formatPhoneNumber, validatePhoneNumber } from '@/utils/shared/phoneNumber'

export const zodPhoneNumber = string()
  .refine(validatePhoneNumber, 'Please enter a valid phone number')
  .transform(formatPhoneNumber)

export const zodOptionalEmptyPhoneNumber = union([zodPhoneNumber, literal('')])
