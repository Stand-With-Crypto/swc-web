import { UserInformationVisibility } from '@prisma/client'

import { ClientUser, ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import {
  SensitiveDataClientUser,
  SensitiveDataClientUserWithENSData,
} from '@/clientModels/clientUser/sensitiveDataClientUser'
import { userFirstNameWithLastInitial } from '@/utils/shared/userFullName'

/*
Some high profile organizations had donations that aren't linked to their actual
ENS but want the ENS displayed on the website. This hardcode fixes that issue.
*/
const HARDCODED_USER_DISPLAY_NAME: Record<string, { displayName: string }> = {
  '21143cb6-edce-4f42-b51a-c014e7f8363b': {
    displayName: 'geminifrontierfund.eth',
  },
}

export const getUserDisplayName = (
  user: Pick<
    ClientUserWithENSData,
    'firstName' | 'lastName' | 'informationVisibility' | 'primaryUserCryptoAddress' | 'id'
  > | null,
) => {
  if (user?.id && HARDCODED_USER_DISPLAY_NAME[user.id]) {
    return HARDCODED_USER_DISPLAY_NAME[user.id].displayName
  }
  if (user?.informationVisibility === UserInformationVisibility.ANONYMOUS) {
    return 'Anonymous'
  }
  if (
    (user?.firstName || user?.lastName) &&
    user?.informationVisibility === UserInformationVisibility.ALL_INFO
  ) {
    return userFirstNameWithLastInitial(user)
  }
  if (user?.primaryUserCryptoAddress) {
    return (
      user.primaryUserCryptoAddress.ensName ||
      `${user.primaryUserCryptoAddress.cryptoAddress.slice(
        0,
        2,
      )}...${user.primaryUserCryptoAddress.cryptoAddress.slice(-5)}`
    )
  }
  return 'Anonymous'
}

export const getUserDisplayNameWithoutENS = (
  user: Pick<
    ClientUser,
    'firstName' | 'lastName' | 'informationVisibility' | 'primaryUserCryptoAddress'
  > | null,
) => {
  if (user?.informationVisibility === UserInformationVisibility.ANONYMOUS) {
    return 'Anonymous'
  }
  if (user?.firstName && user?.informationVisibility === UserInformationVisibility.ALL_INFO) {
    return userFirstNameWithLastInitial(user)
  }
  if (user?.primaryUserCryptoAddress) {
    return `${user.primaryUserCryptoAddress.cryptoAddress.slice(
      0,
      2,
    )}...${user.primaryUserCryptoAddress.cryptoAddress.slice(-5)}`
  }
  return 'Anonymous'
}

export const getSensitiveDataUserDisplayName = (
  user: SensitiveDataClientUserWithENSData | null,
) => {
  if (user?.firstName) {
    return userFirstNameWithLastInitial(user)
  }
  if (user?.hasEmbeddedWallet && user.primaryUserEmailAddress) {
    return user.primaryUserEmailAddress.emailAddress
  }
  if (user?.primaryUserCryptoAddress) {
    return (
      user.primaryUserCryptoAddress.ensName ||
      `${user.primaryUserCryptoAddress.cryptoAddress.slice(
        0,
        2,
      )}...${user.primaryUserCryptoAddress.cryptoAddress.slice(-5)}`
    )
  }
  return 'Anonymous'
}

export const getFullSensitiveDataUserDisplayName = (user: SensitiveDataClientUser | null) => {
  if (user?.firstName) {
    return userFirstNameWithLastInitial(user)
  }
  if (user?.primaryUserCryptoAddress) {
    return user.primaryUserCryptoAddress.cryptoAddress
  }
}

export const USER_INFORMATION_VISIBILITY_ORDERED_LIST: UserInformationVisibility[] = [
  UserInformationVisibility.ANONYMOUS,
  UserInformationVisibility.CRYPTO_INFO_ONLY,
  UserInformationVisibility.ALL_INFO,
]

export const USER_INFORMATION_VISIBILITY_DISPLAY_NAME_MAP: Record<
  UserInformationVisibility,
  string
> = {
  [UserInformationVisibility.ANONYMOUS]: 'Anonymous',
  [UserInformationVisibility.CRYPTO_INFO_ONLY]: 'Crypto Info Only',
  [UserInformationVisibility.ALL_INFO]: 'All Info',
}
