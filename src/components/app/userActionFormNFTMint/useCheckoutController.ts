import React from 'react'
import { useContract, useSDK } from '@thirdweb-dev/react'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import {
  ETH_NFT_DONATION_AMOUNT,
  MINT_NFT_CONTRACT_ADDRESS,
} from '@/components/app/userActionFormNFTMint/constants'
import { fromBigNumber, toBigNumber } from '@/utils/shared/bigNumber'

export interface UseCheckoutControllerReturn {
  mintFeeDisplay?: string
  gasFeeDisplay?: string
  totalFeeDisplay?: string
  totalFee?: BigNumber
  quantity: number
  incrementQuantity: () => void
  decrementQuantity: () => void
  setQuantity: (quantity: number) => void
}

export function useCheckoutController({
  mintUnitFee = ETH_NFT_DONATION_AMOUNT,
} = {}): UseCheckoutControllerReturn {
  const [quantity, setQuantity] = React.useState(1)
  const { data: gasFee } = useGasFee(quantity)

  const values = React.useMemo<
    Pick<
      UseCheckoutControllerReturn,
      'mintFeeDisplay' | 'gasFeeDisplay' | 'totalFeeDisplay' | 'totalFee'
    >
  >(() => {
    if (!gasFee) {
      return {}
    }

    const mintFee = mintUnitFee.mul(quantity)
    const totalFee = mintFee.add(gasFee)

    return {
      mintFeeDisplay: fromBigNumber(mintFee),
      gasFeeDisplay: fromBigNumber(gasFee),
      totalFeeDisplay: fromBigNumber(totalFee),
      totalFee,
    }
  }, [gasFee, mintUnitFee, quantity])

  return {
    ...values,
    quantity,
    incrementQuantity: () => setQuantity(prev => prev + 1),
    decrementQuantity: () => setQuantity(prev => Math.max(prev - 1, 1)),
    setQuantity,
  }
}

function useGasFee(quantity: number) {
  const contextSDK = useSDK()
  const { contract: contextContract } = useContract(MINT_NFT_CONTRACT_ADDRESS)

  return useSWR({ sdk: contextSDK, contract: contextContract }, async ({ sdk, contract }) => {
    if (!sdk || !contract) {
      return
    }

    const prepareTx = await contract.erc721.claim.prepare(quantity)
    const gasFee = await prepareTx.estimateGasCost()
    return toBigNumber(gasFee.ether)
  })
}
