import { literal, string, union } from 'zod'

import { normalizePhoneNumber, validatePhoneNumber } from '@/utils/shared/phoneNumber'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function zodPhoneNumber(countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE) {
  return string()
    .refine(
      phoneNumber => validatePhoneNumber(phoneNumber, countryCode),
      'Please enter a valid phone number',
    )
    .transform(phoneNumber => normalizePhoneNumber(phoneNumber, countryCode))
}

export const zodOptionalEmptyPhoneNumber = (countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE) =>
  union([zodPhoneNumber(countryCode), literal('')])
