import { Address, User, UserCryptoAddress, UserInformationVisibility } from '@prisma/client'

import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'

export type ClientUser = ClientModel<
  Pick<User, 'id' | 'informationVisibility'> & {
    firstName: string | null
    lastName: string | null
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
    userLocationDetails: {
      administrativeAreaLevel1: string
      countryCode: string
    } | null
  }
>

export type GetClientProps = User & {
  primaryUserCryptoAddress: null | UserCryptoAddress
  address: Address | null
}

export const getClientUser = (record: GetClientProps): ClientUser => {
  const { firstName, lastName, primaryUserCryptoAddress, id, informationVisibility, address } =
    record

  const userLocationDetails =
    address && address.countryCode === 'US'
      ? {
          administrativeAreaLevel1: address.administrativeAreaLevel1,
          countryCode: address.countryCode,
        }
      : null

  return getClientModel({
    firstName: informationVisibility === UserInformationVisibility.ALL_INFO ? firstName : null,
    lastName: informationVisibility === UserInformationVisibility.ALL_INFO ? lastName : null,
    primaryUserCryptoAddress:
      informationVisibility !== UserInformationVisibility.ANONYMOUS && primaryUserCryptoAddress
        ? getClientUserCryptoAddress(primaryUserCryptoAddress)
        : null,
    id,
    informationVisibility,
    userLocationDetails,
  })
}

export type ClientUserWithENSData = Omit<ClientUser, 'primaryUserCryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export const getClientUserWithENSData = (
  record: GetClientProps,
  ensData: UserENSData | null | undefined,
): ClientUserWithENSData => {
  const initial = getClientUser(record)
  return {
    ...initial,
    primaryUserCryptoAddress:
      record.informationVisibility !== UserInformationVisibility.ANONYMOUS &&
      record.primaryUserCryptoAddress
        ? getClientUserCryptoAddressWithENSData(record.primaryUserCryptoAddress, ensData)
        : null,
  }
}
