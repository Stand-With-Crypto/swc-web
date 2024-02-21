import { Address } from 'viem'

export function stringToEthereumAddress(addr: string) {
  if (!addr.startsWith('0x')) {
    return null
  }
  return addr as Address
}
