import {
  Address,
  User,
  UserCryptoAddress,
  UserEmailAddress,
  UserInformationVisibility,
} from '@prisma/client'

import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export type ClientUser = ClientModel<
  Pick<User, 'id' | 'informationVisibility'> & {
    firstName: string | null
    lastName: string | null
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
    userLocationDetails: {
      swcCivicAdministrativeArea: string | null
      administrativeAreaLevel1: string
      countryCode: string
    } | null
    manuallySetInformation?: {
      displayName: string
      profilePictureUrl: string
    }
    countryCode: string
  }
>

type GetClientProps = User & {
  primaryUserCryptoAddress: null | UserCryptoAddress
  address: Address | null
}

export const getClientUser = (record: GetClientProps): ClientUser => {
  const {
    firstName,
    lastName,
    primaryUserCryptoAddress,
    id,
    informationVisibility,
    address,
    countryCode,
  } = record

  const userLocationDetails = getClientUserAddressInfo(address)

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
    countryCode,
  })
}

const getClientUserAddressInfo = (address: Address | null) => {
  if (!address) {
    return null
  }

  const { success: isCountryCodeSupported } = zodSupportedCountryCode.safeParse(
    address.countryCode.toLowerCase(),
  )

  if (!isCountryCodeSupported) {
    return null
  }

  return {
    swcCivicAdministrativeArea: address.swcCivicAdministrativeArea,
    administrativeAreaLevel1:
      address.swcCivicAdministrativeArea ?? address.administrativeAreaLevel1,
    countryCode: address.countryCode,
  }
}

export type ClientUnidentifiedUser = ClientModel<{
  emailAddress: string | null
}>
export const getClientUnidentifiedUser = (
  record: User & { primaryUserEmailAddress: UserEmailAddress | null },
): ClientUnidentifiedUser => {
  return getClientModel({
    emailAddress: record.primaryUserEmailAddress?.emailAddress ?? null,
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
