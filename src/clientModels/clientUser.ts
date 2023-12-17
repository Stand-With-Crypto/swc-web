import { CryptoAddressUser } from '@prisma/client'

export type ClientCryptoAddressUser = Pick<
  CryptoAddressUser,
  'address' | 'id' | 'sampleDatabaseIncrement' | 'datetimeCreated' | 'datetimeUpdated'
>

export const getClientCryptoAddressUser = (user: CryptoAddressUser): ClientCryptoAddressUser => {
  const { address, id, sampleDatabaseIncrement, datetimeCreated, datetimeUpdated } = user
  return {
    address,
    id,
    sampleDatabaseIncrement,
    datetimeCreated,
    datetimeUpdated,
  }
}
