import { inngest } from '@/inngest/inngest'
import { $Enums } from '@prisma/client'
import { engineAirdropNFT } from '@/utils/server/thirdweb/engineAirdropNFT'
import { updateMinNFTStatus } from '@/utils/server/airdrop'
import NFTMintStatus = $Enums.NFTMintStatus
import { NFT_REQUESTED_INNGEST_EVENT_NAME } from '@/inngest/functions/updateNFTStatus'
import { onFailureAirdropNFT } from '@/inngest/onFailureAirdropNFT'
import { airdropPayload, getAirdropStatusPayload } from '@/utils/server/airdrop/payload'

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
    // const walletAddress = event.data.walletAddress as string

    const queryId = await step.run('airdropNFT', async () => {
      return await engineAirdropNFT(payload.contractAddress, payload.recipientWalletAddress, 1)
    })

    await step.run('update-mintNFT-Status', async () => {
      await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.CLAIMED, '')
    })

    await step.sleep('wait-before-checking-status', '20s')
    const getStatusPayload: getAirdropStatusPayload = {
      nftMintId: payload.nftMintId,
      queryId: queryId,
    }
    await step.sendEvent('send-nft-requested-event', {
      name: NFT_REQUESTED_INNGEST_EVENT_NAME,
      data: getStatusPayload,
    })
  },
)
