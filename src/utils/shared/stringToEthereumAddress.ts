import { Address } from 'viem'

export function stringToEthereumAddress(addr: string) {
  const regex = new RegExp('^0x[a-fA-F0-9]{40}$')
  if (!regex.test(addr)) {
    return null
  }
  return addr as Address
}
