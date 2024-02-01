import { inngest } from '@/inngest/inngest'
import { $Enums } from '@prisma/client'
import { engineGetMintStatus } from '@/utils/server/thirdweb/engineAirdropNFT'
import { updateMinNFTStatus } from '@/utils/server/nft'
import NFTMintStatus = $Enums.NFTMintStatus
import { onFailureUpdateNFTStatus } from '@/inngest/onFailureAirdropNFT'
import { RetryAfterError } from 'inngest'
import { getAirdropStatusPayload } from '@/utils/server/nft/payload'

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
    const payload = event.data as getAirdropStatusPayload

    const result = await step.run('update-mintNFT-Status', async () => {
      return await engineGetMintStatus(payload.queryId)
    })

    if (result.status === 'mined') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.CLAIMED, result.transactionHash!)
      })
    } else if (result.status === 'errored' || result.status === 'cancelled') {
      await step.run('update-mintNFT-Status', async () => {
        await updateMinNFTStatus(payload.nftMintId, NFTMintStatus.FAILED, '')
      })
    } else {
      throw new RetryAfterError('NFT not processed yet', '20s')
    }
  },
)
