import React from 'react'
import { Base } from '@thirdweb-dev/chains'
import { useBalance, useChainId } from '@thirdweb-dev/react'
import { BigNumber } from 'ethers'

export type CheckoutError = 'insufficientFunds' | 'networkSwitch'

export function useCheckoutError({ totalFee }: { totalFee: BigNumber }): CheckoutError | void {
  const chainId = useChainId()
  const { data: walletBalance } = useBalance()

  const hasInsufficientFunds = React.useMemo(() => {
    if (!walletBalance) {
      return true
    }

    return walletBalance.value.lt(totalFee)
  }, [totalFee, walletBalance])

  const incorrectNetwork = chainId !== Base.chainId
  if (incorrectNetwork) {
    return 'networkSwitch'
  }

  if (hasInsufficientFunds) {
    return 'insufficientFunds'
  }
}
