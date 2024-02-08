import * as Sentry from '@sentry/nextjs'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import {
  UserWallet,
  useContract,
  useContractMetadata,
  useSDK,
  useWatchTransactions,
} from '@thirdweb-dev/react'
import React from 'react'
import { keccak256, toHex } from 'viem'
import { noop } from 'lodash'

type Status = 'idle' | 'loading' | 'completed' | 'canceled' | 'error'

type UseSendMintNFTTransactionOptions = {
  contractAddress: string
  quantity: number
  onStatusChange?: (status: Status) => void
}

export function useSendMintNFTTransaction({
  contractAddress,
  quantity,
  onStatusChange = noop,
}: UseSendMintNFTTransactionOptions) {
  const sdk = useSDK()
  const { contract } = useContract(contractAddress)
  const { data: contractMetadata } = useContractMetadata(contract)

  const [status, setStatus] = React.useState<Status>('idle')
  const [sendTransactionResponse, setSendTransactionResponse] = React.useState<Awaited<
    ReturnType<UserWallet['sendRawTransaction']>
  > | null>(null)

  const handleChangeStatus = React.useCallback(
    (newStatus: Status) => {
      setStatus(newStatus)
      onStatusChange(newStatus)
    },
    [onStatusChange],
  )

  const mintNFT = React.useCallback(async (): Promise<Status> => {
    if (!sdk || !contractMetadata || !contract) {
      return 'idle'
    }

    handleChangeStatus('loading')
    try {
      const transaction = await contract.erc721.claim.prepare(quantity)

      const callData = transaction.encode()
      const metadata = keccak256(toHex('US')).slice(2, 10)
      const callDataWithMetadata = callData + metadata

      const claimData = await sdk.wallet.sendRawTransaction({
        to: contractAddress,
        data: callDataWithMetadata,
        value: await transaction.getValue(),
      })

      setSendTransactionResponse(claimData)
      handleChangeStatus('completed')
      return 'completed'
    } catch (e) {
      const error = getErrorInstance(e)
      Sentry.captureException(error)

      if (error.message.includes('user rejected transaction')) {
        handleChangeStatus('canceled')
        return 'canceled'
      }

      handleChangeStatus('error')
      return 'error'
    }
  }, [contract, contractAddress, contractMetadata, quantity, sdk])

  return {
    mintNFT,
    status,
    sendTransactionResponse,
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

  return new Error(`Unknown error: ${String(maybeError)}`)
}
