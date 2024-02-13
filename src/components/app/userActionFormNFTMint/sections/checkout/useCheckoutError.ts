import React from 'react'
import { useBalance, useChainId } from '@thirdweb-dev/react'
import { BigNumber } from 'ethers'

export type CheckoutError = 'insufficientFunds' | 'networkSwitch'

interface UseCheckoutErrorConfig {
  totalFee?: BigNumber
  contractChainId?: number
}

export function useCheckoutError({
  totalFee,
  contractChainId,
}: UseCheckoutErrorConfig): CheckoutError | null {
  const chainId = useChainId()
  const { data: walletBalance, isLoading: isLoadingWalletBallance } = useBalance()

  const hasInsufficientFunds = React.useMemo(() => {
    if (isLoadingWalletBallance || !totalFee) {
      return false
    }

    if (!walletBalance) {
      return true
    }

    return walletBalance.value.lt(totalFee)
  }, [isLoadingWalletBallance, totalFee, walletBalance])

  if (chainId && chainId !== contractChainId) {
    return 'networkSwitch'
  }

  if (hasInsufficientFunds) {
    return 'insufficientFunds'
  }

  return null
}
