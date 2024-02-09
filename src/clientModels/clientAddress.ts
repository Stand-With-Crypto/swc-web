import { ClientModel, getClientModel } from '@/clientModels/utils'
import { Address } from '@prisma/client'

export type ClientAddress = ClientModel<
  Pick<Address, 'id' | 'googlePlaceId' | 'formattedDescription'>
>

export const getClientAddress = (record: Address): ClientAddress => {
  const { id, googlePlaceId, formattedDescription } = record
  return getClientModel({
    formattedDescription,
    googlePlaceId,
    id,
  })
}
