import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { BigNumber } from 'ethers'
import useSWR from 'swr'
import { estimateGasCost, getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { claimTo } from 'thirdweb/extensions/erc721'

import {
  ETH_NFT_DONATION_AMOUNT,
  MINT_NFT_CONTRACT_ADDRESS,
} from '@/components/app/userActionFormNFTMint/constants'
import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { fromBigNumber } from '@/utils/shared/bigNumber'
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
  const gasNumberInBigNumber = BigNumber.from(0).add(gasFee ?? 0)

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
      gasFeeDisplay: fromBigNumber(gasNumberInBigNumber),
      totalFeeDisplay: fromBigNumber(totalFee),
      totalFee,
    }
  }, [gasFee, mintUnitFee, quantity, gasNumberInBigNumber])

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
  const { user } = useThirdwebAuthUser()
  const address = user?.address

  const shouldFetch = contract && address

  return useSWR(
    shouldFetch ? contract : null,
    async _contract => {
      const tx = claimTo({
        contract: _contract,
        quantity: BigInt(quantity),
        to: address || '',
      })
      const gasFee = await estimateGasCost({ transaction: tx })
      return gasFee.wei
    },
    {
      onError: error => {
        Sentry.captureException(error, {
          extra: {
            quantity,
            contract,
            user,
            address,
          },
          tags: { domain: 'useCheckoutController' },
        })
      },
    },
  )
}
