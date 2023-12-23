import { ClientUser } from '@/clientModels/clientUser/clientUser'

export const getUserDisplayName = (userCryptoAddress: ClientUser | null) => {
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
