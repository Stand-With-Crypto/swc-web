import { backfillNFT } from '@/inngest/functions/backfillNFT/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  limit: number
  persist: boolean
}

const BACKFILL_NFT_INNGEST_EVENT_NAME = 'script/backfill-nft'
const BACKFILL_NFT_INNGEST_FUNCTION_ID = 'script.backfill-nft'
export const backfillNFTWithInngest = inngest.createFunction(
  {
    id: BACKFILL_NFT_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_NFT_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const payload = event.data as ScriptPayload
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
