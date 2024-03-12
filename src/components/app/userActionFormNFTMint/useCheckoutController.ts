import React from 'react'
import { useContract } from '@thirdweb-dev/react'
import { BigNumber } from 'ethers'
import useSWR from 'swr'

import {
  ETH_NFT_DONATION_AMOUNT,
  MINT_NFT_CONTRACT_ADDRESS,
} from '@/components/app/userActionFormNFTMint/constants'
import { fromBigNumber } from '@/utils/shared/bigNumber'

const CLAIM_GAS_LIMIT_OE721_CONTRACT = 231086
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
  const { data: gasUnitFee } = useGasFee(quantity)

  const values = React.useMemo<
    Pick<
      UseCheckoutControllerReturn,
      'mintFeeDisplay' | 'gasFeeDisplay' | 'totalFeeDisplay' | 'totalFee'
    >
  >(() => {
    if (!gasUnitFee) {
      return {}
    }

    const mintFee = mintUnitFee.mul(quantity)
    const gasFee = gasUnitFee.mul(quantity)
    const totalFee = mintFee.add(gasFee)

    return {
      mintFeeDisplay: fromBigNumber(mintFee),
      gasFeeDisplay: fromBigNumber(gasFee),
      totalFeeDisplay: fromBigNumber(totalFee),
      totalFee,
    }
  }, [gasUnitFee, mintUnitFee, quantity])

  return {
    ...values,
    quantity,
    incrementQuantity: () => setQuantity(prev => prev + 1),
    decrementQuantity: () => setQuantity(prev => Math.max(prev - 1, 1)),
    setQuantity,
  }
}

function useGasFee(quantity: number) {
  const { contract: contextContract } = useContract(MINT_NFT_CONTRACT_ADDRESS)
  return useSWR({ contract: contextContract }, async ({ contract }) => {
    if (!contract) {
      return
    }
    const prepareTx = await contract.erc721.claim.prepare(quantity)
    prepareTx.updateOverrides({ gasLimit: CLAIM_GAS_LIMIT_OE721_CONTRACT })
    const gasFee = await prepareTx.estimateGasCost()
    return gasFee.wei
  })
}
