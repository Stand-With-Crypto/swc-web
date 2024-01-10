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
    'id' | 'datetimeCreated' | 'datetimeUpdated' | 'isPubliclyVisible' | 'fullName' | 'phoneNumber'
  > & {
    cryptoAddress: ClientUserCryptoAddress | null
    primaryUserEmailAddress: { address: string } | null
  }
>

export const getSensitiveDataClientUser = (
  record: User & {
    userCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
): SensitiveDataClientUser => {
  const {
    fullName,
    userCryptoAddress,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    primaryUserEmailAddress,
    phoneNumber,
  } = record

  return getClientModel({
    fullName,
    primaryUserEmailAddress: primaryUserEmailAddress
      ? {
          address: primaryUserEmailAddress.address,
        }
      : null,
    cryptoAddress: userCryptoAddress ? getClientUserCryptoAddress(userCryptoAddress) : null,
    id,
    datetimeCreated,
    datetimeUpdated,
    isPubliclyVisible,
    phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : '',
  })
}

export type SensitiveDataClientUserWithENSData = Omit<SensitiveDataClientUser, 'cryptoAddress'> & {
  cryptoAddress: ClientUserCryptoAddressWithENSData | null
}

export const getSensitiveDataClientUserWithENSData = (
  record: User & {
    userCryptoAddress: null | UserCryptoAddress
    primaryUserEmailAddress: UserEmailAddress | null
  },
  ensData: UserENSData | null | undefined,
): SensitiveDataClientUserWithENSData => {
  const initial = getSensitiveDataClientUser(record)
  return {
    ...initial,
    cryptoAddress: record.userCryptoAddress
      ? getClientUserCryptoAddressWithENSData(record.userCryptoAddress, ensData)
      : null,
  }
}
