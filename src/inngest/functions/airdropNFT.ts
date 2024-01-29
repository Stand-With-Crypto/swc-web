import { inngest } from '@/inngest/inngest'
import { NFTMint } from '@prisma/client'
import { onFailureAirdropNFT } from '@/inngest/onFaillureAirdropNFT'
import { airdropNFT } from '@/utils/server/thirdweb/airdropNFT'

export const AIRDROP_NFT_INNGEST_FUNCTION_ID = 'action.airdrop-nft'
export const AIRDROP_NFT_INNGEST_EVENT_NAME = 'action/airdrop.request'

export const airdropNFTWithInngest = inngest.createFunction(
  {
    id: AIRDROP_NFT_INNGEST_FUNCTION_ID,
    retries: 2,
    onFailure: onFailureAirdropNFT,
  },
  { event: AIRDROP_NFT_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const action = event.data.userAction as NFTMint
    const walletAddress = event.data.walletAddress as string

    return await step.run('airdropNFT', async () => {
      return await airdropNFT(action.contractAddress, walletAddress, 1)
    })
  },
)
