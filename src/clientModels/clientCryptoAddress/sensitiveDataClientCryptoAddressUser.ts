import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { Address, CryptoAddressUser } from '@prisma/client'

export type SensitiveDataClientCryptoAddressUser = ClientModel<
  Pick<
    CryptoAddressUser,
    | 'name'
    | 'cryptoAddress'
    | 'id'
    | 'sampleDatabaseIncrement'
    | 'datetimeCreated'
    | 'datetimeUpdated'
    | 'isPubliclyVisible'
  >
>

export const getSensitiveDataClientCryptoAddressUser = (
  record: CryptoAddressUser,
): SensitiveDataClientCryptoAddressUser => {
  const {
    name,
    cryptoAddress,
    id,
    sampleDatabaseIncrement,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  } = record
  return getClientModel({
    name,
    cryptoAddress,
    id,
    sampleDatabaseIncrement,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  })
}
