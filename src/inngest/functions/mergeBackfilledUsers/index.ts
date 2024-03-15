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
}

const logger = getLogger('mergeBackfilledUsers')

const MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID = 'script.merge-backfilled-users'
const MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME = 'script/merge.backfilled.users'

const MERGE_BACKFILLED_USERS_BATCH_SIZE = 20

export const mergeBackfilledUsersWithInngest = inngest.createFunction(
  {
    id: MERGE_BACKFILLED_USERS_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: MERGE_BACKFILLED_USERS_INNGEST_EVENT_NAME },
  async ({ event }) => {
    const payload = event.data as ScriptPayload

    await calculateAndLogDuplicateUserCounts()

    let currentMergedUserCount = 0
    let userIdsToSkip: string[] = []
    while (currentMergedUserCount < payload.limit) {
      const { mergedUsersCount, newUserIdsToSkip } = await mergeBackfilledUsers({
        limit: Math.min(payload.limit - currentMergedUserCount, MERGE_BACKFILLED_USERS_BATCH_SIZE),
        persist: payload.persist,
        userIdsToSkip,
      })
      if (mergedUsersCount === 0) {
        logger.info('No more users to merge')
        break
      }
      currentMergedUserCount += mergedUsersCount
      userIdsToSkip = userIdsToSkip.concat(newUserIdsToSkip)
      logger.info(`Merged ${currentMergedUserCount} users so far`)
    }

    logger.info('Finished merging backfilled users', { currentMergedUserCount })

    return {
      dryRun: !payload.persist,
      mergedUserCount: currentMergedUserCount,
    }
  },
)
