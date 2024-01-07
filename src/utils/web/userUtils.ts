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
  if (user?.cryptoAddress) {
    return `${user.cryptoAddress.address.slice(0, 2)}...${user.cryptoAddress.address.slice(-5)}`
  }
  return 'Anonymous'
}

export const getSensitiveDataUserName = (user: SensitiveDataClientUser | null) => {
  if (user?.fullName) {
    return user.fullName
  }
  if (user?.cryptoAddress) {
    return `${user.cryptoAddress.address.slice(0, 2)}...${user.cryptoAddress.address.slice(-5)}`
  }
  return 'Anonymous'
}
