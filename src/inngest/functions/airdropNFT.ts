import { inngest } from '@/inngest/inngest'
import { $Enums } from '@prisma/client'
import { engineAirdropNFT, engineGetMintStatus } from '@/utils/server/thirdweb/engineAirdropNFT'
import NFTMintStatus = $Enums.NFTMintStatus
import { onFailureAirdropNFT } from '@/inngest/onFailureAirdropNFT'
import { airdropPayload } from '@/utils/server/nft/payload'
import { updateMintNFTStatus } from '@/utils/server/nft/updateMintNFTStatus'

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
    const payload = event.data as airdropPayload

    const queryId = await step.run('airdrop-NFT', async () => {
      return await engineAirdropNFT(payload.contractAddress, payload.recipientWalletAddress, 1)
    })

    let attempt = 1
    const finaleStates = ['mined', 'errored', 'cancelled']
    let mintStatus: string | null = null
    let transactionHash: string | null
    while (
      (attempt <= 5 && mintStatus === null) ||
      (attempt <= 5 && mintStatus !== null && !finaleStates.includes(mintStatus))
    ) {
      await step.sleep(`wait-before-checking-status-${attempt}`, `${attempt * 20}s`)
      const transactionStatus = await engineGetMintStatus(queryId)
      mintStatus = transactionStatus.status
      transactionHash = transactionStatus.transactionHash
      attempt += 1
    }

    if (!mintStatus || !finaleStates.includes(mintStatus)) {
      throw new Error('cannot get final states of minting request')
    }

    if (mintStatus === 'mined') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMintNFTStatus(payload.nftMintId, NFTMintStatus.CLAIMED, transactionHash)
      })
      return
    }

    if (mintStatus === 'errored' || mintStatus === 'cancelled') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMintNFTStatus(payload.nftMintId, NFTMintStatus.FAILED, transactionHash)
      })
      return
    }
  },
)
