import { object, string } from 'zod'

export const zodAddress = object({
  administrativeAreaLevel1: string(),
  administrativeAreaLevel2: string(),
  countryCode: string().length(2),
  formattedDescription: string(),
  googlePlaceId: string(),
  locality: string(),
  postalCode: string(),
  postalCodeSuffix: string(),
  route: string(),
  streetNumber: string(),
  subpremise: string(),
})
