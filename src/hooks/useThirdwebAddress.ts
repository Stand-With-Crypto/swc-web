// eslint-disable-next-line no-restricted-imports
import { useAddress } from '@thirdweb-dev/react'

export function useThirdwebAddress() {
  const address = useAddress()
  return address ? parseThirdwebAddress(address) : address
}

export function parseThirdwebAddress(address: string) {
  return address?.toLocaleLowerCase()
}
