import { backfillDonationAction } from '@/inngest/functions/backfillDonationAction/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  limit: number
  persist: boolean
}

const BACKFILL_DONATION_ACTION_EVENT_NAME = 'script/backfill-donation-action'
const BACKFILL_DONATION_ACTION_FUNCTION_ID = 'script.backfill-donation-action'
export const backfillDonationActionWithInngest = inngest.createFunction(
  {
    id: BACKFILL_DONATION_ACTION_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_DONATION_ACTION_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload
    return await step.run('execute-script', async () => {
      return await backfillDonationAction({
        limit: payload.limit,
        persist: payload.persist,
      })
    })
  },
)
