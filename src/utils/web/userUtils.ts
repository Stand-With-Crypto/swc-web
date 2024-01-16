import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'

export const getUserDisplayName = (user: ClientUser | null) => {
  // TODO prioritize ENS first
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

export const getSensitiveDataUserDisplayName = (user: SensitiveDataClientUser | null) => {
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

export const getFullSensitiveDataUserDisplayName = (user: SensitiveDataClientUser | null) => {
  if (user?.fullName) {
    return user.fullName
  }
  if (user?.primaryUserCryptoAddress) {
    return user.primaryUserCryptoAddress.cryptoAddress
  }
}
