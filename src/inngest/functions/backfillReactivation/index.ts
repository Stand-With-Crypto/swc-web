import { backfillReactivation } from '@/inngest/functions/backfillReactivation/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  limit: number
  recursive: boolean
  testEmail?: string
  persist?: boolean
}

const BACKFILL_REACTIVATION_INNGEST_EVENT_NAME = 'script/backfill-reactivation'
const BACKFILL_REACTIVATION_INNGEST_FUNCTION_ID = 'script.backfill-reactivation'

export const backfillReactivationWithInngest = inngest.createFunction(
  {
    id: BACKFILL_REACTIVATION_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: BACKFILL_REACTIVATION_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload
    return await step.run('execute-script', async () => {
      return await backfillReactivation({
        limit: payload.limit,
        recursive: payload.recursive,
        testEmail: payload.testEmail,
        persist: payload.persist,
      })
    })
  },
)
