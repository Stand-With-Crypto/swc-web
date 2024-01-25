import {
  ClientUserCryptoAddress,
  ClientUserCryptoAddressWithENSData,
  getClientUserCryptoAddress,
  getClientUserCryptoAddressWithENSData,
} from '@/clientModels/clientUser/clientUserCryptoAddress'
import { ClientModel, getClientModel } from '@/clientModels/utils'
import { UserENSData } from '@/data/web3/types'
import { formatPhoneNumber } from '@/utils/shared/phoneNumber'
import { User, UserCryptoAddress, UserEmailAddress } from '@prisma/client'

export type SensitiveDataClientUser = ClientModel<
  Pick<
    User,
    | 'id'
    | 'datetimeCreated'
    | 'datetimeUpdated'
    | 'isPubliclyVisible'
    | 'firstName'
    | 'lastName'
    | 'phoneNumber'
  > & {
    primaryUserCryptoAddress: ClientUserCryptoAddress | null
    primaryUserEmailAddress: { emailAddress: string } | null
  }
>

export function getSensitiveDataClientUser(
  record: User & {
    primaryUserCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
): SensitiveDataClientUser {
  const {
    firstName,
    lastName,
    primaryUserCryptoAddress,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    primaryUserEmailAddress,
    phoneNumber,
  } = record

  return getClientModel({
    firstName,
    lastName,
    primaryUserEmailAddress: primaryUserEmailAddress
      ? {
          emailAddress: primaryUserEmailAddress.emailAddress,
        }
      : null,
    primaryUserCryptoAddress: primaryUserCryptoAddress
      ? getClientUserCryptoAddress(primaryUserCryptoAddress)
      : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
  })
}

export type SensitiveDataClientUserWithENSData = Omit<SensitiveDataClientUser, 'cryptoAddress'> & {
  primaryUserCryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export function getSensitiveDataClientUserWithENSData(
  record: User & {
    primaryUserCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
  ensData: UserENSData | null | undefined,
): SensitiveDataClientUserWithENSData {
  const initial = getSensitiveDataClientUser(record)
  return {
    ...initial,
    primaryUserCryptoAddress: record.primaryUserCryptoAddress
      ? getClientUserCryptoAddressWithENSData(record.primaryUserCryptoAddress, ensData)
      : null,
  }
}
