import { string } from 'zod'

import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const zodSupportedCountryCode = string()
  .transform(value => {
    const lowerCaseCountryCode = value?.toLowerCase()

    // TODO(@twistershark): After we start supporting UK, we should return SupportedCountryCodes.UK instead of 'uk'
    if (lowerCaseCountryCode === 'gb') return 'uk'
    return lowerCaseCountryCode
  })
  .refine(value => ORDERED_SUPPORTED_COUNTRIES.includes(value), { message: 'Invalid country code' })
