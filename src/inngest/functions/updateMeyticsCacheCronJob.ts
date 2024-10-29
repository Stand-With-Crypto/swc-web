import { setVoterActionsCountCache } from '@/data/aggregations/getCountVoterActions'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const UPDATE_METRICS_CACHE_CRON_JOB_SCHEDULE = '*/10 * * * *' // Every 10 minutes.
const UPDATE_METRICS_CACHE_CRON_JOB_FUNCTION_ID = 'script.update-metrics-cache-cron-job'
const UPDATE_METRICS_CACHE_CRON_JOB_EVENT_NAME = 'script/update.metrics.cache.cron.job'

export interface UpdateMetricsCounterCacheCronJobSchema {
  name: typeof UPDATE_METRICS_CACHE_CRON_JOB_EVENT_NAME
}

export const updateMetricsCacheInngestCronJob = inngest.createFunction(
  {
    id: UPDATE_METRICS_CACHE_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: UPDATE_METRICS_CACHE_CRON_JOB_SCHEDULE }
      : { event: UPDATE_METRICS_CACHE_CRON_JOB_EVENT_NAME }),
  },
  () => setVoterActionsCountCache(),
)
