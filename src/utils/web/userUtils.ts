import { ClientUser } from '@/clientModels/clientUser/clientUser'

export const getUserDisplayName = (userCryptoAddress: ClientUser | null) => {
  // TODO prioritize ENS first
  if (userCryptoAddress?.name) {
    return userCryptoAddress.name
  }
  if (userCryptoAddress?.cryptoAddress) {
    return `${userCryptoAddress.cryptoAddress.address.slice(
      0,
      2,
    )}...${userCryptoAddress.cryptoAddress.address.slice(-5)}`
  }
  return 'Anonymous'
}
