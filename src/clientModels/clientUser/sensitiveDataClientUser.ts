import { Address, User, UserCryptoAddress, UserEmailAddress } from '@prisma/client'

import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import {
  getSensitiveClientUserEmailAddress,
  SensitiveClientUserEmailAddress,
} from '@/clientModels/clientUser/clientUserEmailAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { formatPhoneNumber } from '@/utils/shared/phoneNumber'

export type SensitiveDataClientUser = ClientModel<
  Pick<
    User,
    | 'id'
    | 'informationVisibility'
    | 'firstName'
    | 'lastName'
    | 'phoneNumber'
    | 'hasOptedInToMembership'
    | 'smsStatus'
    | 'referralId'
    | 'countryCode'
  > & {
    hasEmbeddedWallet: boolean
    datetimeCreated: string
    datetimeUpdated: string
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
    primaryUserEmailAddress: SensitiveClientUserEmailAddress | null
    userLocationDetails: {
      administrativeAreaLevel1: string
      countryCode: string
    } | null
  }
>

export const getSensitiveDataClientUser = (
  record: User & {
    address: Address | null
    primaryUserCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
): SensitiveDataClientUser => {
  const {
    firstName,
    lastName,
    primaryUserCryptoAddress,
    id,
    datetimeCreated,
    datetimeUpdated,
    informationVisibility,
    primaryUserEmailAddress,
    phoneNumber,
    hasOptedInToMembership,
    referralId,
    address,
    smsStatus,
    countryCode,
  } = record
  const userLocationDetails = address
    ? {
        administrativeAreaLevel1: address.administrativeAreaLevel1,
        countryCode: address.countryCode,
      }
    : null

  return getClientModel({
    firstName,
    lastName,
    referralId,
    hasEmbeddedWallet: Boolean(primaryUserCryptoAddress?.embeddedWalletUserEmailAddressId),
    primaryUserEmailAddress: primaryUserEmailAddress
      ? getSensitiveClientUserEmailAddress(primaryUserEmailAddress)
      : null,
    primaryUserCryptoAddress: primaryUserCryptoAddress
      ? getClientUserCryptoAddress(primaryUserCryptoAddress)
      : null,
    id,
    datetimeCreated: datetimeCreated.toISOString(),
    datetimeUpdated: datetimeUpdated.toISOString(),
    informationVisibility,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
    hasOptedInToMembership,
    userLocationDetails,
    smsStatus,
    countryCode,
  })
}

export type SensitiveDataClientUserWithENSData = Omit<SensitiveDataClientUser, 'cryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export const getSensitiveDataClientUserWithENSData = (
  record: User & {
    primaryUserCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
    address: Address | null
  },
  ensData: UserENSData | null | undefined,
): SensitiveDataClientUserWithENSData => {
  const initial = getSensitiveDataClientUser(record)
  return {
    ...initial,
    primaryUserCryptoAddress: record.primaryUserCryptoAddress
      ? getClientUserCryptoAddressWithENSData(record.primaryUserCryptoAddress, ensData)
      : null,
  }
}
