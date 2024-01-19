import { ClientUser, ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import {
  SensitiveDataClientUser,
  SensitiveDataClientUserWithENSData,
} from '@/clientModels/clientUser/sensitiveDataClientUser'

export const getUserDisplayName = (user: ClientUserWithENSData | null) => {
  if (user?.isPubliclyVisible === false) {
    return 'Anonymous'
  }
  if (user?.fullName) {
    return user.fullName
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

export const getUserDisplayNameWithoutENS = (user: ClientUser | null) => {
  if (user?.isPubliclyVisible === false) {
    return 'Anonymous'
  }
  if (user?.fullName) {
    return user.fullName
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
  if (user?.fullName) {
    return user.fullName
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
  if (user?.fullName) {
    return user.fullName
  }
  if (user?.primaryUserCryptoAddress) {
    return user.primaryUserCryptoAddress.cryptoAddress
  }
}
