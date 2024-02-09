import { User, UserCryptoAddress, UserEmailAddress } from '@prisma/client'

import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
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
    | 'hasOptedInToSms'
  > & {
    datetimeCreated: string
    datetimeUpdated: string
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
    primaryUserEmailAddress: Pick<UserEmailAddress, 'emailAddress' | 'source'> | null
  }
>

export const getSensitiveDataClientUser = (
  record: User & {
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
    hasOptedInToSms,
  } = record

  return getClientModel({
    firstName,
    lastName,
    primaryUserEmailAddress: primaryUserEmailAddress
      ? {
          emailAddress: primaryUserEmailAddress.emailAddress,
          source: primaryUserEmailAddress.source,
        }
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
    hasOptedInToSms,
  })
}

export type SensitiveDataClientUserWithENSData = Omit<SensitiveDataClientUser, 'cryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export const getSensitiveDataClientUserWithENSData = (
  record: User & {
    primaryUserCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
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
