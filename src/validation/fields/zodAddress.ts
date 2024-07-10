import { object, string } from 'zod'

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
})
