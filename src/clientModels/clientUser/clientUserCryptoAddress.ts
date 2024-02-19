import { UserCryptoAddress } from '@prisma/client'

import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { censorWord } from '@/utils/server/obscenityMatcher'

export type ClientUserCryptoAddress = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork' | 'datetimeUpdated'>
>

export const getClientUserCryptoAddress = (record: UserCryptoAddress): ClientUserCryptoAddress => {
  const { id, cryptoAddress, cryptoNetwork, datetimeUpdated } = record
  return getClientModel({
    id,
    cryptoAddress,
    cryptoNetwork,
    datetimeUpdated,
  })
}

export type ClientUserCryptoAddressWithENSData = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork' | 'datetimeUpdated'> &
    UserENSData
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
