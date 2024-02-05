import { inngest } from '@/inngest/inngest'
import { engineAirdropNFT } from '@/utils/server/thirdweb/engineAirdropNFT'
import { onFailureAirdropNFT } from '@/inngest/onFailureAirdropNFT'
import { AirdropPayload } from '@/utils/server/nft/payload'
import {
  THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS,
  updateMintNFTStatus,
} from '@/utils/server/nft/updateMintNFTStatus'
import {
  engineGetMintStatus,
  THIRDWEB_TRANSACTION_STATUSES,
  ThirdwebTransactionStatus,
} from '@/utils/server/thirdweb/engineGetMintStatus'
import { NonRetriableError } from 'inngest'

export const AIRDROP_NFT_INNGEST_EVENT_NAME = 'app/airdrop.request'
const AIRDROP_NFT_INNGEST_FUNCTION_ID = 'airdrop-nft'
const AIRDROP_NFT_RETRY = 2

export const airdropNFTWithInngest = inngest.createFunction(
  {
    id: AIRDROP_NFT_INNGEST_FUNCTION_ID,
    retries: AIRDROP_NFT_RETRY,
    onFailure: onFailureAirdropNFT,
  },
  { event: AIRDROP_NFT_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as AirdropPayload

    const queryId = await step.run('airdrop-NFT', async () => {
      return engineAirdropNFT(payload.contractAddress, payload.recipientWalletAddress, 1)
    })

    let attempt = 1

    let mintStatus: ThirdwebTransactionStatus | null = null
    let transactionHash: string | null
    let gasPrice: string | null
    while (
      (attempt <= 5 && mintStatus === null) ||
      (attempt <= 5 && mintStatus !== null && !THIRDWEB_TRANSACTION_STATUSES.includes(mintStatus))
    ) {
      await step.sleep(`wait-before-checking-status-${attempt}`, `${attempt * 20}s`)
      const transactionStatus = await engineGetMintStatus(queryId)
      mintStatus = transactionStatus.status
      gasPrice = transactionStatus.gasPrice
      transactionHash = transactionStatus.transactionHash
      attempt += 1
    }

    if (!mintStatus || !THIRDWEB_TRANSACTION_STATUSES.includes(mintStatus)) {
      throw new NonRetriableError('cannot get final states of minting request')
    }

    const status = mintStatus! as ThirdwebTransactionStatus
    await step.run('update-mintNFT-Status', async () => {
      await updateMintNFTStatus(
        payload.nftMintId,
        THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS[status],
        transactionHash,
        gasPrice,
      )
    })
  },
)
