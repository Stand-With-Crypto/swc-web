import { ValidContractInstance, useContract, useContractMetadata } from '@thirdweb-dev/react'

export type ThirdwebContractMetadata = Awaited<ReturnType<ValidContractInstance['metadata']['get']>>

export function useThirdwebContractMetadata(address: string) {
  const { contract } = useContract(address)

  // const { data: fees, error } = usePlatformFees(contract)
  // console.log({ fees, error })
  // output: This functionality is not available because the contract does not implement the 'PlatformFee' Extension. Learn how to unlock this functionality at https://portal.thirdweb.com/extensions

  return useContractMetadata(contract)
}
