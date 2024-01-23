import {
  NFT_DONATION_AMOUNT,
  NFT_DONATION_GAS_FEE,
} from '@/components/app/userActionFormNFTMint/constants'
import React from 'react'

export interface UseCheckoutControllerReturn {
  mintFee: number
  gasFee: number
  totalFee: number
  quantity: number
  incrementQuantity: () => void
  decrementQuantity: () => void
  setQuantity: (quantity: number) => void
}

export function useCheckoutController({
  gasUnitFee = NFT_DONATION_GAS_FEE,
  mintUnitFee = NFT_DONATION_AMOUNT,
} = {}): UseCheckoutControllerReturn {
  const [quantity, setQuantity] = React.useState(1)

  const values = React.useMemo<
    Pick<UseCheckoutControllerReturn, 'mintFee' | 'gasFee' | 'totalFee'>
  >(() => {
    const mintFee = mintUnitFee * quantity
    const gasFee = gasUnitFee * quantity
    const totalFee = mintFee + gasFee

    return {
      mintFee,
      gasFee,
      totalFee,
    }
  }, [mintUnitFee, quantity, gasUnitFee])

  return {
    ...values,
    quantity,
    incrementQuantity: () => setQuantity(prev => prev + 1),
    decrementQuantity: () => setQuantity(prev => Math.max(prev - 1, 1)),
    setQuantity,
  }
}
