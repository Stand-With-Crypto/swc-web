import { getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { getContractMetadata } from 'thirdweb/extensions/common'
import { useReadContract } from 'thirdweb/react'

import { thirdwebClient } from '@/utils/shared/thirdwebClient'

export function useThirdwebContractMetadata(address: string) {
  const contract = getContract({
    address,
    client: thirdwebClient,
    chain: base,
  })

  return useReadContract(getContractMetadata, { contract })
}
