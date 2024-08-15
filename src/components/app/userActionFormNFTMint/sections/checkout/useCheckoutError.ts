import React from 'react'
import { BigNumber } from 'ethers'
import { useActiveWalletChain, useWalletBalance } from 'thirdweb/react'

import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

export type CheckoutError = 'insufficientFunds' | 'networkSwitch' | 'connectWallet'

interface UseCheckoutErrorConfig {
  totalFee?: BigNumber
  contractChainId?: number
}

export function useCheckoutError({
  totalFee,
  contractChainId,
}: UseCheckoutErrorConfig): CheckoutError | null {
  const { user } = useThirdwebAuthUser()
  const chain = useActiveWalletChain()
  const address = user?.address ?? ''
  const { data: walletBalance, isLoading: isLoadingWalletBallance } = useWalletBalance({
    chain: chain,
    address,
    client: thirdwebClient,
  })

  const hasInsufficientFunds = React.useMemo(() => {
    if (isLoadingWalletBallance || !totalFee) {
      return false
    }

    if (!walletBalance) {
      return true
    }

    return walletBalance.value < totalFee.toBigInt()
  }, [isLoadingWalletBallance, totalFee, walletBalance])

  if (chain && chain.id !== contractChainId) {
    return 'networkSwitch'
  }

  if (!address) {
    return 'connectWallet'
  }

  if (hasInsufficientFunds) {
    return 'insufficientFunds'
  }

  return null
}
