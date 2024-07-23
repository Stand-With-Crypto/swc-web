import React from 'react'
import { BigNumber } from 'ethers'
import useSWR from 'swr'
import { estimateGasCost, getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { claimTo } from 'thirdweb/extensions/erc721'
import { useActiveAccount } from 'thirdweb/react'

import {
  ETH_NFT_DONATION_AMOUNT,
  MINT_NFT_CONTRACT_ADDRESS,
} from '@/components/app/userActionFormNFTMint/constants'
import { fromBigNumber } from '@/utils/shared/bigNumber'
import { fromBigInt } from '@/utils/shared/fromBigInt'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

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
      gasFeeDisplay: fromBigInt(gasFee),
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
  const contract = getContract({
    address: MINT_NFT_CONTRACT_ADDRESS,
    client: thirdwebClient,
    chain: base,
  })
  const account = useActiveAccount()

  return useSWR({ contract }, async ({ contract: _contract }) => {
    if (!contract) {
      return
    }

    const tx = claimTo({ contract, quantity: BigInt(quantity), to: account?.address ?? '' })
    const gasFee = await estimateGasCost({ transaction: tx })
    return gasFee.wei
  })
}
