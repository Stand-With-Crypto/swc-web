import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs } from 'inngest'

import { cleanPostalCodes } from '@/bin/oneTimeScripts/cleanPostalCodes'
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

const CLEAN_POSTAL_CODES_INNGEST_EVENT_NAME = 'script/clean-postal-codes'
const CLEAN_POSTAL_CODES_INNGEST_FUNCTION_ID = 'script.clean-postal-codes'
export const cleanPostalCodesWithInngest = inngest.createFunction(
  {
    id: CLEAN_POSTAL_CODES_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onFailureCleanPostalCodes,
  },
  { event: CLEAN_POSTAL_CODES_INNGEST_EVENT_NAME },
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
