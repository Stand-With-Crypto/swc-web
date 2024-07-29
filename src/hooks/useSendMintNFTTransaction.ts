import React, { useMemo } from 'react'
import * as Sentry from '@sentry/nextjs'
import { isPlainObject } from 'lodash-es'
import { getContract } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { claimTo } from 'thirdweb/extensions/erc721'
import { useActiveAccount } from 'thirdweb/react'

import { logger } from '@/utils/shared/logger'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { safeStringify } from '@/utils/web/safeStringify'

export type MintStatus = 'idle' | 'loading' | 'completed' | 'canceled' | 'error'

type UseSendMintNFTTransactionOptions = {
  contractAddress: string
  quantity: number
}

export function useSendMintNFTTransaction({
  contractAddress,
  quantity,
}: UseSendMintNFTTransactionOptions) {
  const contract = useMemo(() => {
    return getContract({
      address: contractAddress,
      client: thirdwebClient,
      chain: base,
    })
  }, [contractAddress])

  const account = useActiveAccount()

  const [transactionHash, setTransactionHash] = React.useState<string | null>(null)

  const handleTransactionException = React.useCallback(
    (e: unknown, extra: Record<string, unknown>) => {
      const error = getErrorInstance(e)
      Sentry.captureException(error, {
        extra,
        tags: { domain: 'useSendMintNFTTransaction' },
      })
      logger.error('Error minting NFT', error)
    },
    [],
  )

  const prepareTransaction = React.useCallback(async () => {
    return claimTo({
      contract,
      to: account?.address ?? '',
      quantity: BigInt(quantity),
    })
  }, [quantity, account?.address, contract])

  return {
    prepareTransaction,
    transactionHash,
    setTransactionHash,
    handleTransactionException,
  }
}

export function getErrorInstance(maybeError: unknown): Error {
  if (!maybeError) {
    return new Error('Empty error')
  }

  if (typeof maybeError === 'string') {
    return new Error(maybeError)
  }

  if (maybeError instanceof Error) {
    return maybeError
  }

  if (isPlainObject(maybeError)) {
    return new Error(`Unknown error: ${safeStringify(maybeError)}`)
  }

  return new Error(`Unknown error: ${String(maybeError)}`)
}
