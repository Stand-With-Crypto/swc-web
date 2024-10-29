import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { setVoterActionsCountCache } from '@/data/aggregations/getCountVoterActions'

const UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_SCHEDULE = '*/10 * * * *' // Every 10 minutes.
const UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_FUNCTION_ID =
  'script.update-voter-actions-cache-cron-job'
const UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_EVENT_NAME =
  'script/update.voter.actions.cache.cron.job'

export interface UpdateVoterActionsCounterCacheCronJobSchema {
  name: typeof UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_EVENT_NAME
}

/**
 * This Inngest function is a cron job responsible for backfilling the NFTs for the user actions that were skipped/missed.
 * The code is written in a fashion to support Inngest multi-step functions and memoize states.
 */
export const updateVoterActionsCounterCacheInngestCronJob = inngest.createFunction(
  {
    id: UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_SCHEDULE }
      : { event: UPDATE_VOTER_ACTIONS_COUNT_CACHE_CRON_JOB_EVENT_NAME }),
  },
  () => setVoterActionsCountCache(),
)
