import {
  NFT_DONATION_AMOUNT,
  NFT_DONATION_GAS_FEE,
} from '@/components/app/userActionFormNFTMint/constants'
import React from 'react'

export function useCheckoutController({
  gasUnitFee = NFT_DONATION_GAS_FEE,
  mintUnitFee = NFT_DONATION_AMOUNT,
} = {}) {
  const [quantity, setQuantity] = React.useState(1)

  const truncate = React.useCallback((num: number) => Math.round(num * 1000) / 1000, [])

  const values = React.useMemo(() => {
    const mintFee = truncate(mintUnitFee * quantity)
    const gasFee = truncate(gasUnitFee * quantity)
    const total = mintFee + gasFee

    return {
      mintFee,
      gasFee,
      total,
    }
  }, [truncate, mintUnitFee, quantity, gasUnitFee])

  return {
    ...values,
    quantity,
    incrementQuantity: () => setQuantity(prev => prev + 1),
    decrementQuantity: () => setQuantity(prev => Math.max(prev - 1, 1)),
    setQuantity,
  }
}
