import { inngest } from '@/inngest/inngest'
import { $Enums, NFTMint } from '@prisma/client'
import { engineGetMintStatus } from '@/utils/server/thirdweb/engineAirdropNFT'
import { updateMinNFTStatus } from '@/utils/server/airdrop'
import NFTMintStatus = $Enums.NFTMintStatus
import { onFailureUpdateNFTStatus } from '@/inngest/onFailureAirdropNFT'
import { RetryAfterError } from 'inngest'

export const NFT_REQUESTED_INNGEST_EVENT_NAME = 'app/NTF.requested'
const NFT_REQUESTED_INNGEST_FUNCTION_ID = 'update-nft-status'
const NFT_UPDATE_STATUS_RETRY = 10

export const updateNFTStatus = inngest.createFunction(
  {
    id: NFT_REQUESTED_INNGEST_FUNCTION_ID,
    retries: NFT_UPDATE_STATUS_RETRY,
    onFailure: onFailureUpdateNFTStatus,
  },
  { event: NFT_REQUESTED_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const mintNft = event.data.userAction as NFTMint
    const queryId = event.data.queryId as string

    const result = await step.run('update-mintNFT-Status', async () => {
      return await engineGetMintStatus(queryId)
    })

    if (result.status === 'mined') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMinNFTStatus(mintNft.id, NFTMintStatus.CLAIMED, result.transactionHash!)
      })
    } else if (result.status === 'errored' || result.status === 'cancelled') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMinNFTStatus(mintNft.id, NFTMintStatus.FAILED, '')
      })
    } else {
      throw new RetryAfterError('NFT not processed yet', '20s')
    }
  },
)
