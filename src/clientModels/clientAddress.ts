import { Address } from '@prisma/client'

import { ClientModel, getClientModel } from '@/clientModels/utils'

export type ClientAddress = ClientModel<Pick<Address, 'id' | 'formattedDescription'>> & {
  googlePlaceId: string
}

export const getClientAddress = (record: Address): ClientAddress | null => {
  const { id, googlePlaceId, formattedDescription } = record
  // all addresses should have google places, but we want to gracefully fail if google starts hard-capping us for some reason
  if (!googlePlaceId) {
    return null
  }
  return getClientModel({
    id,
    googlePlaceId,
    formattedDescription,
  })
}
