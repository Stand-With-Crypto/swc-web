import { string } from 'zod'

import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const zodSupportedCountryCode = string()
  .transform(value => value?.toLowerCase())
  .refine(value => ORDERED_SUPPORTED_COUNTRIES.includes(value), { message: 'Invalid country code' })
