import { Address } from '@prisma/client'

import { ClientModel, getClientModel } from '@/clientModels/utils'

export type ClientAddress = ClientModel<
  Pick<Address, 'id' | 'googlePlaceId' | 'formattedDescription'>
>

export const getClientAddress = (record: Address): ClientAddress => {
  const { id, googlePlaceId, formattedDescription } = record
  return getClientModel({
    id,
    googlePlaceId,
    formattedDescription,
  })
}
