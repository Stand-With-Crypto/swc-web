import { ClientUser, ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import {
  SensitiveDataClientUser,
  SensitiveDataClientUserWithENSData,
} from '@/clientModels/clientUser/sensitiveDataClientUser'
import { UserENSData } from '@/data/web3/types'

export const getUserDisplayName = (user: ClientUserWithENSData | null) => {
  // TODO prioritize ENS first
  if (user?.isPubliclyVisible === false) {
    return 'Anonymous'
  }
  if (user?.fullName) {
    return user.fullName
  }
  if (user?.cryptoAddress) {
    return (
      user.cryptoAddress.ensName ||
      `${user.cryptoAddress.address.slice(0, 2)}...${user.cryptoAddress.address.slice(-5)}`
    )
  }
  return 'Anonymous'
}

export const getSensitiveDataUserDisplayName = (
  user: SensitiveDataClientUserWithENSData | null,
) => {
  if (user?.fullName) {
    return user.fullName
  }
  if (user?.cryptoAddress) {
    return (
      user.cryptoAddress.ensName ||
      `${user.cryptoAddress.address.slice(0, 2)}...${user.cryptoAddress.address.slice(-5)}`
    )
  }
  return 'Anonymous'
}

export const getFullSensitiveDataUserDisplayName = (user: SensitiveDataClientUser | null) => {
  if (user?.fullName) {
    return user.fullName
  }
  if (user?.cryptoAddress) {
    return user.cryptoAddress.address
  }
}
