import { mergeBackfilledUsers } from '@/inngest/functions/mergeBackfilledUsers/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

export interface ScriptPayload {
  limit: number
  persist: boolean
}

const MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID = 'script.merge-backfilled-users'
const MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME = 'script/merge.backfilled.users'
export const mergeBackfilledUsersWithInngest = inngest.createFunction(
  {
    id: MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload

    await step.run('script/execute.merge', async () => {
      return await mergeBackfilledUsers({
        limit: payload.limit,
        persist: payload.persist,
      })
    })

    return {
      dryRun: !payload.persist,
    }
  },
)
