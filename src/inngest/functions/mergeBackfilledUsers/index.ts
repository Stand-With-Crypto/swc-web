import {
  calculateAndLogDuplicateUserCounts,
  mergeBackfilledUsers,
} from '@/inngest/functions/mergeBackfilledUsers/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { getLogger } from '@/utils/shared/logger'

export interface ScriptPayload {
  limit: number
  persist: boolean
  includeTotalCountCalculation: boolean
}

const logger = getLogger('mergeBackfilledUsers')

const MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID = 'script.merge-backfilled-users'
const MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME = 'script/merge.backfilled.users'

export const mergeBackfilledUsersWithInngest = inngest.createFunction(
  {
    id: MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME },
  async ({ event }) => {
    const payload = event.data as ScriptPayload
    if (!payload.limit || payload.limit <= 0) {
      logger.info('`limit` not provided - defaulting to 100')
      payload.limit = 100
    }

    if (payload.includeTotalCountCalculation) {
      await calculateAndLogDuplicateUserCounts()
    }

    const mergedUserCount = await mergeBackfilledUsers({
      limit: payload.limit,
      persist: payload.persist,
    })

    logger.info('Finished merging backfilled users', { mergedUserCount })

    return {
      dryRun: !payload.persist,
      mergedUserCount,
    }
  },
)
