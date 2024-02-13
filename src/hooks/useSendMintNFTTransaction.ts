import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { useContract, useContractMetadata, UserWallet, useSDK } from '@thirdweb-dev/react'
import { noop } from 'lodash'
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

  const mintNFT = React.useCallback(async (): Promise<MintStatus> => {
    if (!sdk || !contractMetadata || !contract) {
      return 'idle'
    }

    handleChangeStatus('loading')
    try {
      const transaction = await contract.erc721.claim.prepare(quantity)
      const callData = transaction.encode()
      const usResidencyMetadata = keccak256(toHex('US')).slice(2, 10)
      const callDataWithMetadata = callData + (isUSResident ? usResidencyMetadata : '')

      //   {
      //     "hash": "0xf59196bc781856e26d79178a004f3fd09c08091318265e6bbb47b182c68b860b",
      //     "type": 2,
      //     "accessList": [],
      //     "blockHash": "0x958a80d298c5f365763d7dba50295dc50c287f820e4b04438ab7e0488dd0a698",
      //     "blockNumber": 10484570,
      //     "transactionIndex": 2,
      //     "confirmations": 1,
      //     "from": "0xc5e11d2CaFBb8CA1b3F387b954fe6E1c97e07F97",
      //     "gasPrice": {
      //         "type": "BigNumber",
      //         "hex": "0x0f438d"
      //     },
      //     "maxPriorityFeePerGas": {
      //         "type": "BigNumber",
      //         "hex": "0x0f4240"
      //     },
      //     "maxFeePerGas": {
      //         "type": "BigNumber",
      //         "hex": "0x0f4399"
      //     },
      //     "gasLimit": {
      //         "type": "BigNumber",
      //         "hex": "0x025c3e"
      //     },
      //     "to": "0x34E2377911fFEF18fB611Bd877D46390908fca19",
      //     "value": {
      //         "type": "BigNumber",
      //         "hex": "0xb5e620f48000"
      //     },
      //     "nonce": 131,
      //     "data": "0x84bb1e42000000000000000000000000c5e11d2cafbb8ca1b3f387b954fe6e1c97e07f970000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000b5e620f4800000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000b5e620f48000000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      //     "r": "0x434b8f99a041f0c1b4665a9868fd17d3973b1ffd1f822665336688c73920fc5e",
      //     "s": "0x2c034a937092f197d1fadbdad6ff7c3df67b77495873d65fd3422afb56e06d71",
      //     "v": 0,
      //     "creates": null,
      //     "chainId": 8453
      // }
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
      logger.error('Error minting NFT', error)

      if (error.message.includes('user rejected transaction')) {
        handleChangeStatus('canceled')
        return 'canceled'
      }

      handleChangeStatus('error')
      return 'error'
    }
  }, [contract, contractAddress, contractMetadata, handleChangeStatus, isUSResident, quantity, sdk])

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

  return new Error(`Unknown error: ${String(maybeError)}`)
}
