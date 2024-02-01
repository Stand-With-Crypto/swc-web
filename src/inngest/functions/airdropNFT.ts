import { inngest } from '@/inngest/inngest'
import { $Enums } from '@prisma/client'
import { engineAirdropNFT, engineGetMintStatus } from '@/utils/server/thirdweb/engineAirdropNFT'
import { updateMinNFTStatus } from '@/utils/server/nft'
import NFTMintStatus = $Enums.NFTMintStatus
import { onFailureAirdropNFT } from '@/inngest/onFailureAirdropNFT'
import { airdropPayload } from '@/utils/server/nft/payload'

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

    const queryId = await step.run('airdropNFT', async () => {
      return await engineAirdropNFT(payload.contractAddress, payload.recipientWalletAddress, 1)
    })

    await step.run('update-mintNFT-Status', async () => {
      await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.CLAIMED, '')
    })

    let attempt = 1
    const finaleStates = ['mined', 'errored', 'cancelled']
    let resultWeWant: string | null = null
    let transactionHash: string | null
    while (
      (attempt <= 5 && resultWeWant === null) ||
      (attempt <= 5 && resultWeWant !== null && !finaleStates.includes(resultWeWant))
    ) {
      await step.sleep('wait-before-checking-status-' + attempt, `${attempt * 20}s`)
      const transactionStatus = await engineGetMintStatus(queryId)
      resultWeWant = transactionStatus.status
      transactionHash = transactionStatus.transactionHash
      attempt += 1
    }

    if (!resultWeWant || !finaleStates.includes(resultWeWant)) {
      throw new Error('cannot get final states of minting request')
    }

    if (resultWeWant === 'mined') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.CLAIMED, transactionHash)
      })
      return
    }

    if (resultWeWant === 'errored' || resultWeWant === 'cancelled') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.FAILED, transactionHash)
      })
      return
    }
  },
)
