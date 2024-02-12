import { useContract, useContractMetadata, ValidContractInstance } from '@thirdweb-dev/react'

export type ThirdwebContractMetadata = Awaited<ReturnType<ValidContractInstance['metadata']['get']>>

export function useThirdwebContractMetadata(address: string) {
  const { contract } = useContract(address)
  return useContractMetadata(contract)
}
