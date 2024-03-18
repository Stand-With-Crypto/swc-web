import { executeBackfillNFTCronJobLogic } from '@/inngest/functions/backfillNFTCronJob/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const BACKFILL_NFT_INNGEST_CRON_JOB_SCHEDULE = '*/20 * * * *' // Every 20 minutes.
const BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID = 'script.backfill-nft-cron-job'
const BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME = 'script/backfill.nft.cron.job'
export const backfillNFTInngestCronJob = inngest.createFunction(
  {
    id: BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: BACKFILL_NFT_INNGEST_CRON_JOB_SCHEDULE }
      : { event: BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME }),
  },
  async ({ step }) => {
    const actionsFound = await step.run('script.execute-backfill-nft-cron-job-logic', async () => {
      return await executeBackfillNFTCronJobLogic()
    })
    return {
      actionsFound,
    }
  },
)
