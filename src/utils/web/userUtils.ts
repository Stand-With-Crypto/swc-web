import { UserInformationVisibility } from '@prisma/client'

import { ClientUser, ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import {
  SensitiveDataClientUser,
  SensitiveDataClientUserWithENSData,
} from '@/clientModels/clientUser/sensitiveDataClientUser'
import { userFullName } from '@/utils/shared/userFullName'

export const getUserDisplayName = (
  user: Pick<
    ClientUserWithENSData,
    'firstName' | 'lastName' | 'informationVisibility' | 'primaryUserCryptoAddress'
  > | null,
) => {
  if (user?.informationVisibility === UserInformationVisibility.ANONYMOUS) {
    return 'Anonymous'
  }
  if (user?.firstName && user?.informationVisibility === UserInformationVisibility.ALL_INFO) {
    return userFullName(user)
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
    ClientUserWithENSData,
    'firstName' | 'lastName' | 'informationVisibility' | 'primaryUserCryptoAddress'
  > | null,
) => {
  if (user?.informationVisibility === UserInformationVisibility.ANONYMOUS) {
    return 'Anonymous'
  }
  if (user?.firstName && user?.informationVisibility === UserInformationVisibility.ALL_INFO) {
    return userFullName(user)
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
    return userFullName(user)
  }
  if (user?.hasEmbeddedWallet && user.primaryUserEmailAddress) {
    if (user.primaryUserEmailAddress.emailAddress.length > 13) {
      return `${user.primaryUserEmailAddress.emailAddress.slice(0, 10)}...`
    }
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
    return userFullName(user)
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
