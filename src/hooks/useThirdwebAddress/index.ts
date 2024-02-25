'use client'

// eslint-disable-next-line no-restricted-imports
import { useAddress } from '@thirdweb-dev/react'

import { parseThirdwebAddress } from './parseThirdwebAddress'

export function useThirdwebAddress() {
  const address = useAddress()
  return address ? parseThirdwebAddress(address) : address
}
