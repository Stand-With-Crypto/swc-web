import { ClientCryptoAddressUser } from '@/clientModels/clientCryptoAddress/clientCryptoAddressUser'

export const getCryptoAddressUserDisplayName = (
  cryptoAddressUser: ClientCryptoAddressUser | null,
) => {
  if (cryptoAddressUser?.name) {
    return cryptoAddressUser.name
  }
  if (cryptoAddressUser?.cryptoAddress) {
    return `${cryptoAddressUser.cryptoAddress.slice(
      0,
      2,
    )}...${cryptoAddressUser.cryptoAddress.slice(-5)}`
  }
  return 'Anonymous'
}
