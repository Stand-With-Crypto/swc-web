import React from 'react'
import * as Sentry from '@sentry/nextjs'
import {
  NFT,
  SmartContract,
  Transaction,
  TransactionResultWithId,
  useContract,
  useContractMetadata,
  UserWallet,
  useSDK,
} from '@thirdweb-dev/react'
import { BaseContract } from 'ethers'
import { isPlainObject, noop } from 'lodash-es'
import { keccak256, toHex } from 'viem'

import { logger } from '@/utils/shared/logger'

export type MintStatus = 'idle' | 'loading' | 'completed' | 'canceled' | 'error'

type UseSendMintNFTTransactionOptions = {
  contractAddress: string
  quantity: number
  isUSResident?: boolean
  onStatusChange?: (status: MintStatus) => void
}

export function useSendMintNFTTransaction({
  contractAddress,
  quantity,
  isUSResident = false,
  onStatusChange = noop,
}: UseSendMintNFTTransactionOptions) {
  const sdk = useSDK()
  const { contract } = useContract(contractAddress)
  const { data: contractMetadata } = useContractMetadata(contract)

  const [status, setStatus] = React.useState<MintStatus>('idle')
  const [sendTransactionResponse, setSendTransactionResponse] = React.useState<Awaited<
    ReturnType<UserWallet['sendRawTransaction']>
  > | null>(null)

  const handleChangeStatus = React.useCallback(
    (newStatus: MintStatus) => {
      setStatus(newStatus)
      onStatusChange(newStatus)
    },
    [onStatusChange],
  )

  const handleException = React.useCallback(
    (e: unknown, extra: Record<string, unknown>): MintStatus => {
      const error = getErrorInstance(e)
      Sentry.captureException(error, {
        extra,
        tags: { domain: 'useSendMintNFTTransaction' },
      })
      logger.error('Error minting NFT', error)

      if (error.message.includes('user rejected transaction')) {
        handleChangeStatus('canceled')
        return 'canceled'
      }

      handleChangeStatus('error')
      return 'error'
    },
    [handleChangeStatus],
  )

  const prepareMint = React.useCallback(
    async (smartContract: SmartContract<BaseContract>) => {
      const transaction = await smartContract.erc721.claim.prepare(quantity)
      const callData = transaction.encode()
      const usResidencyMetadata = keccak256(toHex('US')).slice(2, 10)
      const callDataWithMetadata = callData + (isUSResident ? usResidencyMetadata : '')

      return {
        transaction,
        callDataWithMetadata,
      }
    },
    [isUSResident, quantity],
  )

  const mintNFT = React.useCallback(async (): Promise<MintStatus> => {
    if (!sdk || !contractMetadata || !contract) {
      return 'idle'
    }
    handleChangeStatus('loading')

    let transaction: Transaction<TransactionResultWithId<NFT>[]>
    let callDataWithMetadata: string
    try {
      const result = await prepareMint(contract)
      transaction = result.transaction
      callDataWithMetadata = result.callDataWithMetadata
    } catch (e) {
      return handleException(e, {
        contractMetadata,
        contractAddress,
      })
    }

    try {
      const claimData = await sdk.wallet.sendRawTransaction({
        to: contractAddress,
        data: callDataWithMetadata,
        value: await transaction.getValue(),
      })

      setSendTransactionResponse(claimData)
      handleChangeStatus('completed')
      return 'completed'
    } catch (e) {
      return handleException(e, {
        transaction,
        callDataWithMetadata,
      })
    }
  }, [
    contract,
    contractAddress,
    contractMetadata,
    handleChangeStatus,
    handleException,
    prepareMint,
    sdk,
  ])

  return {
    mintNFT,
    status,
    sendTransactionResponse,
  }
}

export type TransactionResponse = NonNullable<
  ReturnType<typeof useSendMintNFTTransaction>['sendTransactionResponse']
>

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
    return new Error(`Unknown error: ${JSON.stringify(maybeError)}`)
  }

  return new Error(`Unknown error: ${String(maybeError)}`)
}
