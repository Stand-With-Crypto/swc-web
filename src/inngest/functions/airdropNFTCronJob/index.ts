import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('backfillNFTCronJob')

const BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID = 'script.backfill-nft-cron-job'
export const backfillNFTInngestCronJob = inngest.createFunction(
  {
    id: BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },

  { cron: '*/20 * * * *' }, // Every 20 minutes. TODO - make the cron only on production, and event otherwise.
  async ({ step }) => {
    const currentAirdropTransactionFee = await step.run(
      'script.fetch-current-airdrop-transaction-fee',
      async () => {
        return await fetchAirdropTransactionFee()
      },
    )

    logger.info(`Current airdrop transaction fee: ${currentAirdropTransactionFee}`)
  },
)
