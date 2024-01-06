import { ClientUser } from '@/clientModels/clientUser/clientUser'

export const getUserDisplayName = (userCryptoAddress: ClientUser | null) => {
  // TODO prioritize ENS first
  if (userCryptoAddress?.isPubliclyVisible === false) {
    return 'Anonymous'
  }
  if (userCryptoAddress?.fullName) {
    return userCryptoAddress.fullName
  }
  if (userCryptoAddress?.cryptoAddress) {
    return `${userCryptoAddress.cryptoAddress.address.slice(
      0,
      2,
    )}...${userCryptoAddress.cryptoAddress.address.slice(-5)}`
  }
  return 'Anonymous'
}
