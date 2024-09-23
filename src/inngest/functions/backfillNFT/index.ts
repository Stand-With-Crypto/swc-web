import { backfillNFT } from '@/inngest/functions/backfillNFT/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

const BACKFILL_NFT_INNGEST_EVENT_NAME = 'script/backfill-nft'
const BACKFILL_NFT_INNGEST_FUNCTION_ID = 'script.backfill-nft'

export type BackfillNftInngestSchema = {
  name: typeof BACKFILL_NFT_INNGEST_EVENT_NAME
  data: {
    limit?: number
    persist: boolean
  }
}

export const backfillNFTWithInngest = inngest.createFunction(
  {
    id: BACKFILL_NFT_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_NFT_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const payload = event.data
    return await step.run('execute-script', async () => {
      return await backfillNFT(
        {
          limit: payload.limit,
          persist: payload.persist,
        },
        logger,
      )
    })
  },
)
