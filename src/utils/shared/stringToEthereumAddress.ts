import { Address } from 'viem'

export function stringToEthereumAddress(addr: string) {
  if (!addr.startsWith('0x')) {
    throw new Error(`Invalid ethereum address ${addr}`)
  }
  return addr as Address
}
