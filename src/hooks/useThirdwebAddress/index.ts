'use client'

import { useActiveAccount } from 'thirdweb/react'

import { parseThirdwebAddress } from './parseThirdwebAddress'

export function useThirdwebAddress() {
  const account = useActiveAccount()
  const address = account?.address
  return address ? parseThirdwebAddress(address) : address
}
