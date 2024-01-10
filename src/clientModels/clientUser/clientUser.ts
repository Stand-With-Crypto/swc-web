import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { User, UserCryptoAddress } from '@prisma/client'

export type ClientUser = ClientModel<
  Pick<User, 'id' | 'datetimeCreated' | 'datetimeUpdated' | 'isPubliclyVisible'> & {
    fullName: string | null
    cryptoAddress: ClientUserCryptoAddress | null
  }
>

export const getClientUser = (
  record: User & { userCryptoAddress: null | UserCryptoAddress },
): ClientUser => {
  const { fullName, userCryptoAddress, id, datetimeCreated, datetimeUpdated, isPubliclyVisible } =
    record
  return getClientModel({
    fullName: isPubliclyVisible ? fullName : null,
    cryptoAddress:
      isPubliclyVisible && userCryptoAddress ? getClientUserCryptoAddress(userCryptoAddress) : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
  })
}

export type ClientUserWithENSData = Omit<ClientUser, 'cryptoAddress'> & {
  cryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export const getClientUserWithENSData = (
  record: User & { userCryptoAddress: null | UserCryptoAddress },
  ensData: UserENSData | null | undefined,
): ClientUserWithENSData => {
  const initial = getClientUser(record)
  return {
    ...initial,
    cryptoAddress: record.userCryptoAddress
      ? getClientUserCryptoAddressWithENSData(record.userCryptoAddress, ensData)
      : null,
  }
}
