import { ClientAddress, getClientAddress } from '@/clientModels/clientAddress'
import { Address, CryptoAddressUser } from '@prisma/client'

export type ClientCryptoAddressUser = Pick<
  CryptoAddressUser,
  | 'name'
  | 'email'
  | 'phoneNumber'
  | 'cryptoAddress'
  | 'id'
  | 'sampleDatabaseIncrement'
  | 'datetimeCreated'
  | 'datetimeUpdated'
  | 'isPubliclyVisible'
>

export const getClientCryptoAddressUser = (record: CryptoAddressUser): ClientCryptoAddressUser => {
  const {
    name,
    email,
    phoneNumber,
    cryptoAddress,
    id,
    sampleDatabaseIncrement,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  } = record
  return {
    name,
    email,
    phoneNumber,
    cryptoAddress,
    id,
    sampleDatabaseIncrement,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  }
}
