import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { actionsWithNFT } from '@/utils/server/nft/actionsWithNFT'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger('backfillNFTCronJob')

// This is the date when SWC went live. We do not care about user actions before this date.
const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

// This is the milliseconds to wait before processing the next batch of user actions.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) || 10000 // 10 seconds.

// This is the number of user actions to process in a single batch.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE) || 20

// This is the ETH threshold in which we will stop the cron job if the current transaction fee exceeds the threshold.
const AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD =
  Number(process.env.AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) || 0.00005

const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME = 0.5 * 60 * 1000 // 9 minutes timeframe to backfill the records, leaving 1 minute before the next run.

const BACKFILL_NFT_INNGEST_CRON_JOB_SCHEDULE = '*/10 * * * *' // Every 10 minutes.
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
    // Initialize variables.
    // The initialization of variables using `step.run` might seem goofy, but see this doc for why this is needed: https://www.inngest.com/docs/functions/multi-step#my-variable-isn-t-updating
    const currentTime = await step.run('script.initialize-constant-variables', async () => {
      return new Date().getTime()
    })
    const maxBackfillCount =
      (BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME /
        BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) *
      BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE
    let batchNum = 1

    // Fetch the user action batches that need to be backfilled.
    const userActionBatches = await step.run('script.get-user-actions', async () => {
      const userActions = await prismaClient.userAction.findMany({
        where: {
          datetimeCreated: { gte: GO_LIVE_DATE },
          nftMint: null,
          actionType: { in: actionsWithNFT },
          user: { primaryUserCryptoAddress: { isNot: null } },
        },
        take: maxBackfillCount,
        include: {
          user: {
            include: { primaryUserCryptoAddress: true },
          },
        },
      })
      logger.info(`Fetched ${userActions.length} user actions to backfill`)
      return chunk(userActions, BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE)
    })

    // Process the user action batches.
    for (const userActionBatch of userActionBatches) {
      // Determine if we should break the loop.
      if (userActionBatch.length === 0) {
        logger.info(`No more user actions to backfill - stopping the cron job`)
        break
      }
      if (new Date().getTime() > currentTime + BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME) {
        logger.info(`Current timestamp has passed the timeframe - stopping the cron job`)
        break
      }
      const currentAirdropTransactionFee = await step.run(
        `script.fetch-airdrop-transaction-fee-${batchNum}`,
        async () => {
          const fee = await fetchAirdropTransactionFee()
          logger.info(`Current airdrop transaction fee: ${fee}`)
          return fee
        },
      )
      if (currentAirdropTransactionFee > AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) {
        logger.info(
          `Current airdrop transaction fee (${currentAirdropTransactionFee}) exceeds the threshold (${AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD}) - stopping the cron job`,
        )
        break
      }

      // Claim the NFT for the user actions.
      await step.run(`script.claim-nfts-${batchNum}`, async () => {
        await Promise.all(
          userActionBatch.map(userAction =>
            claimNFT(userAction, userAction.user.primaryUserCryptoAddress!, {
              ignoreTurnOffNFTMintFlag: true,
            }),
          ),
        )
      })
      batchNum += 1

      // Sleep for the interval duration.
      await step.sleep(
        `script.sleep-${batchNum}`,
        BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL,
      )
    }
  },
)
