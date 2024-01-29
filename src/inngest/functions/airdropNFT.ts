import { inngest } from '@/inngest/inngest'
import { $Enums, NFTMint } from '@prisma/client'
import { onFailureAirdropNFT } from '@/inngest/onFaillureAirdropNFT'
import { airdropNFT } from '@/utils/server/thirdweb/airdropNFT'
import { updateMinNFTStatus } from '@/utils/server/airdrop'
import NFTMintStatus = $Enums.NFTMintStatus

export const AIRDROP_NFT_INNGEST_EVENT_NAME = 'action/airdrop.request'
const AIRDROP_NFT_INNGEST_FUNCTION_ID = 'action.airdrop-nft'
const AIRDROP_NFT_RETRY = 2

export const airdropNFTWithInngest = inngest.createFunction(
  {
    id: AIRDROP_NFT_INNGEST_FUNCTION_ID,
    retries: AIRDROP_NFT_RETRY,
    onFailure: onFailureAirdropNFT,
  },
  { event: AIRDROP_NFT_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const mintNft = event.data.userAction as NFTMint
    const walletAddress = event.data.walletAddress as string

    return await step.run('airdropNFT', async () => {
      const transactionHash = await airdropNFT(mintNft.contractAddress, walletAddress, 1)
      await updateMinNFTStatus(mintNft.id, NFTMintStatus.CLAIMED, transactionHash)
    })
  },
)
