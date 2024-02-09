import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { User, UserCryptoAddress, UserInformationVisibility } from '@prisma/client'

export type ClientUser = ClientModel<
  Pick<User, 'id' | 'informationVisibility'> & {
    firstName: string | null
    lastName: string | null
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
  }
>

export const getClientUser = (
  record: User & { primaryUserCryptoAddress: null | UserCryptoAddress },
): ClientUser => {
  const { firstName, lastName, primaryUserCryptoAddress, id, informationVisibility } = record
  return getClientModel({
    firstName: informationVisibility === UserInformationVisibility.ALL_INFO ? firstName : null,
    id,
    informationVisibility,
    lastName: informationVisibility === UserInformationVisibility.ALL_INFO ? lastName : null,
    primaryUserCryptoAddress:
      informationVisibility !== UserInformationVisibility.ANONYMOUS && primaryUserCryptoAddress
        ? getClientUserCryptoAddress(primaryUserCryptoAddress)
        : null,
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
