import { ETH_NFT_DONATION_AMOUNT } from '@/components/app/userActionFormNFTMint/constants'
import { fromBigNumber, toBigNumber } from '@/utils/shared/bigNumber'
import { getGasPrice, toEther, useSDK } from '@thirdweb-dev/react'
import { BigNumber } from 'ethers'
import React from 'react'
import useSWR from 'swr'

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
  const { data: gasUnitFee } = useGasFee()

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

function useGasFee() {
  const contextSDK = useSDK()

  return useSWR(contextSDK, async sdk => {
    if (!sdk) {
      return
    }

    const gasPrice = await getGasPrice(sdk.getProvider())
    return toBigNumber(toEther(gasPrice))
  })
}
