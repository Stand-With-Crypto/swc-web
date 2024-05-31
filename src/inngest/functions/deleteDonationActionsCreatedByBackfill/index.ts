import { deleteDonationActionsCreatedByBackfill } from '@/inngest/functions/deleteDonationActionsCreatedByBackfill/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  limit: number
  persist: boolean
}

const DELETE_DONATION_ACTIONS_CREATED_BY_BACKFILL_EVENT_NAME =
  'script/delete-donation-actions-created-by-backfill'
const DELETE_DONATION_ACTIONS_CREATED_BY_BACKFILL_FUNCTION_ID =
  'script.delete-donation-actions-created-by-backfill'
export const deleteDonationActionsCreatedByBackfillWithInngest = inngest.createFunction(
  {
    id: DELETE_DONATION_ACTIONS_CREATED_BY_BACKFILL_EVENT_NAME,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: DELETE_DONATION_ACTIONS_CREATED_BY_BACKFILL_FUNCTION_ID },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload
    return await step.run('execute-script', async () => {
      return await deleteDonationActionsCreatedByBackfill({
        limit: payload.limit,
        persist: payload.persist,
      })
    })
  },
)
