import { UserCryptoAddress } from '@prisma/client'
import { isAfter, subMinutes } from 'date-fns'

import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { censorWord } from '@/utils/server/obscenityMatcher'

export type ClientUserCryptoAddress = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork'> & { isRecentlyUpdated: boolean }
>

export const getClientUserCryptoAddress = (record: UserCryptoAddress): ClientUserCryptoAddress => {
  const { id, cryptoAddress, cryptoNetwork, datetimeUpdated } = record
  const isRecentlyUpdated = isAfter(new Date(datetimeUpdated), subMinutes(new Date(), 1))

  return getClientModel({
    id,
    cryptoAddress,
    cryptoNetwork,
    isRecentlyUpdated,
  })
}

export type ClientUserCryptoAddressWithENSData = ClientModel<
  Pick<UserCryptoAddress, 'id' | 'cryptoAddress' | 'cryptoNetwork'> &
    UserENSData & { isRecentlyUpdated: boolean }
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
