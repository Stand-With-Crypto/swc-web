import { cleanPostalCodes } from '@/inngest/functions/cleanupPostalCodes/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

interface ScriptPayload {
  persist: boolean
}

const CLEANUP_POSTAL_CODES_INNGEST_EVENT_NAME = 'script/cleanup-postal-codes'
const CLEANUP_POSTAL_CODES_INNGEST_FUNCTION_ID = 'script.cleanup-postal-codes'
export const cleanupPostalCodesWithInngest = inngest.createFunction(
  {
    id: CLEANUP_POSTAL_CODES_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: CLEANUP_POSTAL_CODES_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload

    const { found, updated } = await step.run('execute-script', async () => {
      return await cleanPostalCodes(payload.persist)
    })

    return {
      dryRun: !payload.persist,
      found: found,
      updated: updated,
    }
  },
)
