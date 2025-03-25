import { literal, string, union, z } from 'zod'

import { normalizePhoneNumber, validatePhoneNumber } from '@/utils/shared/phoneNumber'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const zodPhoneNumber = string()
  .refine(validatePhoneNumber, 'Please enter a valid phone number')
  .transform(normalizePhoneNumber)

export const zodOptionalEmptyPhoneNumber = union([zodPhoneNumber, literal('')])

export function zodPhoneNumberWithCountryCode(countryCode: SupportedCountryCodes) {
  return string()
    .refine(
      phoneNumber => validatePhoneNumber(phoneNumber, countryCode),
      'Please enter a valid phone number',
    )
    .transform(normalizePhoneNumber)
}
