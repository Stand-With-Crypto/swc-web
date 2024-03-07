import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs } from 'inngest'

import { cleanupPostalCodes } from '@/bin/oneTimeScripts/cleanupPostalCodes'
import { inngest } from '@/inngest/inngest'

export interface ScriptPayload {
  persist: boolean
}

async function onFailureCleanPostalCodes(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })
}

const CLEANUP_POSTAL_CODES_INNGEST_EVENT_NAME = 'script/cleanup-postal-codes'
const CLEANUP_POSTAL_CODES_INNGEST_FUNCTION_ID = 'script.cleanup-postal-codes'
export const cleanupPostalCodesWithInngest = inngest.createFunction(
  {
    id: CLEANUP_POSTAL_CODES_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onFailureCleanPostalCodes,
  },
  { event: CLEANUP_POSTAL_CODES_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as ScriptPayload

    const { found, updated } = await step.run('execute-script', async () => {
      return await cleanupPostalCodes(payload.persist)
    })

    return {
      dryRun: !payload.persist,
      found: found,
      updated: updated,
    }
  },
)
