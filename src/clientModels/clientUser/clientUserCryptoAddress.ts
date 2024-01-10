import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { UserCryptoAddress } from '@prisma/client'

export type ClientUserCryptoAddress = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'address' | 'cryptoNetwork'>
>

export const getClientUserCryptoAddress = (record: UserCryptoAddress): ClientUserCryptoAddress => {
  const { id, address, cryptoNetwork } = record
  return getClientModel({
    id,
    address,
    cryptoNetwork,
  })
}

export type ClientUserCryptoAddressWithENSData = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'address' | 'cryptoNetwork'> & UserENSData
>

export const getClientUserCryptoAddressWithENSData = (
  record: UserCryptoAddress,
  ensData: UserENSData | null | undefined,
): ClientUserCryptoAddressWithENSData => {
  if (ensData && ensData?.address !== record.address) {
    throw new Error(
      `ENS data address does not match crypto address: ${JSON.stringify({ ensData, record })}}`,
    )
  }
  return {
    ...getClientUserCryptoAddress(record),
    ensAvatarUrl: ensData?.ensAvatarUrl || null,
    ensName: ensData?.ensName || null,
  }
}
