import { string } from 'zod'

import { isEUCountry } from '@/utils/shared/euCountryMapping'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export const zodSupportedCountryCode = string()
  .transform(value =>
    isEUCountry(value.toLowerCase()) ? SupportedCountryCodes.EU : value?.toLowerCase(),
  )
  .refine(value => ORDERED_SUPPORTED_COUNTRIES.includes(value), { message: 'Invalid country code' })
  .transform(value => value as SupportedCountryCodes)
