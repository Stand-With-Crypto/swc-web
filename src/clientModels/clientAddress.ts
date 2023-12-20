import { Address } from '@prisma/client'

export type ClientAddress = Pick<
  Address,
  'id' | 'streetAddress1' | 'streetAddress2' | 'city' | 'state' | 'zipCode' | 'countryCode'
>

export const getClientAddress = (record: Address): ClientAddress => {
  const { id, streetAddress1, streetAddress2, city, state, zipCode, countryCode } = record
  return {
    id,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zipCode,
    countryCode,
  }
}
