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
  Pick<User, 'id' | 'isPubliclyVisible'> & {
    fullName: string | null
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
  }
>

export const getClientUser = (
  record: User & { primaryUserCryptoAddress: null | UserCryptoAddress },
): ClientUser => {
  const { fullName, primaryUserCryptoAddress, id, isPubliclyVisible } = record
  return getClientModel({
    fullName: isPubliclyVisible ? fullName : null,
    primaryUserCryptoAddress:
      isPubliclyVisible && primaryUserCryptoAddress
        ? getClientUserCryptoAddress(primaryUserCryptoAddress)
        : null,
    id,
    isPubliclyVisible,
  })
}

export type ClientUserWithENSData = Omit<ClientUser, 'primaryUserCryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export const getClientUserWithENSData = (
  record: User & { primaryUserCryptoAddress: null | UserCryptoAddress },
  ensData: UserENSData | null | undefined,
): ClientUserWithENSData => {
  const initial = getClientUser(record)
  return {
    ...initial,
    primaryUserCryptoAddress: record.primaryUserCryptoAddress
      ? getClientUserCryptoAddressWithENSData(record.primaryUserCryptoAddress, ensData)
      : null,
  }
}
