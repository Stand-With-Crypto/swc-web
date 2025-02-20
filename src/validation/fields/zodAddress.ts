import { object, string } from 'zod'

import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export const zodAddress = object({
  googlePlaceId: string().optional(),
  formattedDescription: string(),
  streetNumber: string(),
  route: string(),
  subpremise: string(),
  locality: string(),
  administrativeAreaLevel1: string(),
  administrativeAreaLevel2: string(),
  postalCode: string(),
  postalCodeSuffix: string(),
  countryCode: string().length(2),
  usCongressionalDistrict: string().optional(),
  tenantId: string()
    .refine(value => ORDERED_SUPPORTED_COUNTRIES.includes(value), {
      message: 'Invalid country code',
    })
    .optional(),
})
