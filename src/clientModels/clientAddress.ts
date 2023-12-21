import { ClientModel, getClientModel } from '@/clientModels/utils'
import { Address } from '@prisma/client'

export type ClientAddress = ClientModel<
  Pick<
    Address,
    'id' | 'streetAddress1' | 'streetAddress2' | 'city' | 'state' | 'zipCode' | 'countryCode'
  >
>

export const getClientAddress = (record: Address): ClientAddress => {
  const { id, streetAddress1, streetAddress2, city, state, zipCode, countryCode } = record
  return getClientModel({
    id,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zipCode,
    countryCode,
  })
}
