import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { getBaseETHBalances } from '@/utils/server/basescan/getBaseETHBalances'
import { actionsWithNFT } from '@/utils/server/nft/actionsWithNFT'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { LEGACY_NFT_DEPLOYER_WALLET, SWC_DOT_ETH_WALLET } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { sleep } from '@/utils/shared/sleep'

const logger = getLogger('backfillNFTCronJob')

// This is the milliseconds to wait before processing the next batch of user actions.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) || 10000 // 10 seconds.

// This is the number of user actions to process in a single batch.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE) || 20

// This is the ETH threshold in which we will stop the cron job if the current transaction fee exceeds the threshold.
const AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD =
  Number(process.env.AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) || 0.00006

// This is the date when SWC went live. We do not care about user actions before this date.
const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

const LOW_ETH_BALANCE_THRESHOLD = 0.01
const ETH_BASE_UNIT_WEI = 10 ** 18

const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME = 9 * 60 * 1000 // 9 minutes timeframe to backfill the records, leaving 1 minute before the next run.
const BACKFILL_NFT_INNGEST_CRON_JOB_SCHEDULE = '*/10 * * * *' // Every 10 minutes.
const BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID = 'script.backfill-nft-cron-job'
const BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME = 'script/backfill.nft.cron.job'

/**
 * This Inngest function is a cron job responsible for backfilling the NFTs for the user actions that were skipped/missed.
 */
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
  async () => {
    // Initialize variables.
    const currentTime = new Date().getTime()
    const maxBackfillCount =
      (BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME /
        BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) *
      BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE
    let totalBackfilled = 0

    // Fetch the user action batches that need to be backfilled.
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
    const userActionBatches = chunk(userActions, BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE)

    // Process the user action batches.
    for (const userActionBatch of userActionBatches) {
      // If there are no more user actions to backfill, stop the cron job.
      if (userActionBatch.length === 0) {
        logger.info(`No more user actions to backfill - stopping the cron job`)
        break
      }

      // Check if the current timestamp has passed the timeframe.
      if (new Date().getTime() > currentTime + BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME) {
        logger.info(`Current timestamp has passed the timeframe - stopping the cron job`)
        break
      }

      // Check if the current wallet balances are low.
      const baseETHBalances = await getBaseETHBalances([
        SWC_DOT_ETH_WALLET,
        LEGACY_NFT_DEPLOYER_WALLET,
      ])
      const walletsWithLowETHBalances = baseETHBalances.result.filter(
        cryptoAddress =>
          Number(cryptoAddress.balance) / ETH_BASE_UNIT_WEI < LOW_ETH_BALANCE_THRESHOLD,
      )
      if (walletsWithLowETHBalances && walletsWithLowETHBalances.length > 0) {
        logger.warn(
          `Low Base ETH balance detected for ${walletsWithLowETHBalances
            .map(wallet => wallet.account)
            .join(', ')} - please fund as soon as possible - stopping the cron job`,
        )
        break
      }

      // Check if the current airdrop transaction fee exceeds the threshold.
      const currentAirdropTransactionFee = await fetchAirdropTransactionFee()
      logger.info(`Current airdrop transaction fee: ${currentAirdropTransactionFee}`)
      if (currentAirdropTransactionFee > AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) {
        logger.info(
          `Current airdrop transaction fee (${currentAirdropTransactionFee}) exceeds the threshold (${AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD}) - stopping the cron job`,
        )
        break
      }

      // Claim the NFT for the user actions.
      await Promise.all(
        userActionBatch.map(userAction =>
          claimNFT(userAction, userAction.user.primaryUserCryptoAddress!, {
            ignoreTurnOffNFTMintFlag: true,
          }),
        ),
      )
      totalBackfilled += userActionBatch.length

      // Sleep for the interval duration.
      await sleep(BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL)
    }

    return {
      totalBackfilled,
    }
  },
)
