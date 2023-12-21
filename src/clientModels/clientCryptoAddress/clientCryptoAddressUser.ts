import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { Address, CryptoAddressUser } from '@prisma/client'

export type ClientCryptoAddressUser = ClientModel<
  Pick<CryptoAddressUser, 'id' | 'datetimeCreated' | 'datetimeUpdated' | 'isPubliclyVisible'> & {
    name: string | null
    cryptoAddress: string | null
  }
>

export const getClientCryptoAddressUser = (record: CryptoAddressUser): ClientCryptoAddressUser => {
  const { name, cryptoAddress, id, datetimeCreated, datetimeUpdated, isPubliclyVisible } = record
  return getClientModel({
    name: isPubliclyVisible ? name : null,
    cryptoAddress: isPubliclyVisible ? cryptoAddress : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  })
}
