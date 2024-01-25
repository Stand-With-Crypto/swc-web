import { inngest } from '@/inngest/inngest'

export const MINT_NFT_INNGEST_FUNCTION_ID = "action.mint-nft"
export const MINT_NFT_INNGEST_EVENT_NAME="action/mint.request"

export const mintNFT = inngest.createFunction(
  { id: MINT_NFT_INNGEST_FUNCTION_ID },
  { event: MINT_NFT_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s')
    return { event, body: event.data }
  },
)
