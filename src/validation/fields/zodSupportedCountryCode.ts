import { string } from 'zod'

import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const zodSupportedCountryCode = string().refine(
  value => ORDERED_SUPPORTED_COUNTRIES.includes(value?.toLowerCase()),
  {
    message: 'Invalid country code',
  },
)
