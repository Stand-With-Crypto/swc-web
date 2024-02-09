import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { censorWord } from '@/utils/server/obscenityMatcher'
import { UserCryptoAddress } from '@prisma/client'

export type ClientUserCryptoAddress = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork'>
>

export const getClientUserCryptoAddress = (record: UserCryptoAddress): ClientUserCryptoAddress => {
  const { id, cryptoAddress, cryptoNetwork } = record
  return getClientModel({
    cryptoAddress,
    cryptoNetwork,
    id,
  })
}

export type ClientUserCryptoAddressWithENSData = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork'> & UserENSData
>

export const getClientUserCryptoAddressWithENSData = (
  record: UserCryptoAddress,
  ensData: UserENSData | null | undefined,
): ClientUserCryptoAddressWithENSData => {
  if (ensData && ensData?.cryptoAddress !== record.cryptoAddress) {
    throw new Error(
      `ENS data address does not match crypto address: ${JSON.stringify({ ensData, record })}}`,
    )
  }
  return {
    ...getClientUserCryptoAddress(record),
    ensAvatarUrl: ensData?.ensAvatarUrl || null,
    ensName: ensData?.ensName ? censorWord(ensData.ensName) : null,
  }
}
