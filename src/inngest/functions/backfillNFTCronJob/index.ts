import * as Sentry from '@sentry/nextjs'
import { chunk } from 'lodash-es'

import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { actionsWithNFT } from '@/utils/server/nft/actionsWithNFT'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { LEGACY_NFT_DEPLOYER_WALLET, SWC_DOT_ETH_WALLET } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchBaseETHBalances } from '@/utils/server/thirdweb/fetchBaseETHBalances'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD } from '@/utils/shared/airdropNFTETHTransactionFeeThreshold'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

// This is the milliseconds to wait before processing the next batch of user actions.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) || 10000 // 10 seconds.

// This is the number of user actions to process in a single batch.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE) || 20

// This is the threshold to trigger an alert if there are user actions missing NFTs in which the action's created time is greater than the threshold.
const MISSING_NFT_DAYS_ALERT_THRESHOLD = 3 * 24 * 60 * 60 * 1000 // 3 days.

// This is the date when SWC went live. We do not care about user actions before this date.
const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

const LOW_ETH_BALANCE_THRESHOLD = 0.01

const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME = 9 * 60 * 1000 // 9 minutes timeframe to backfill the records, leaving 1 minute before the next run.
const BACKFILL_NFT_INNGEST_CRON_JOB_SCHEDULE = '*/10 * * * *' // Every 10 minutes.
const BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID = 'script.backfill-nft-cron-job'
const BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME = 'script/backfill.nft.cron.job'

export interface BackfillNftInngestCronJobSchema {
  name: typeof BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME
}
/**
 * This Inngest function is a cron job responsible for backfilling the NFTs for the user actions that were skipped/missed.
 * The code is written in a fashion to support Inngest multi-step functions and memoize states.
 */
export const backfillNFTInngestCronJob = inngest.createFunction(
  {
    id: BACKFILL_NFT_INNGEST_CRON_JOB_FUNCTION_ID,
    retries: 1,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: BACKFILL_NFT_INNGEST_CRON_JOB_SCHEDULE }
      : { event: BACKFILL_NFT_INNGEST_CRON_JOB_EVENT_NAME }),
  },
  async ({ step, logger }) => {
    // Initialize variables.
    // The initialization of variables using `step.run` might seem silly, but see this doc for why this is needed: https://www.inngest.com/docs/functions/multi-step#my-variable-isn-t-updating
    const currentTime = new Date().getTime()

    const maxBackfillCount =
      (BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME /
        BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) *
      BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE
    let batchNum = 1
    let stopMessage = ''

    const whereUserActionToBackfill = {
      datetimeCreated: { gte: GO_LIVE_DATE },
      nftMint: null,
      actionType: { in: actionsWithNFT },
      user: { primaryUserCryptoAddress: { isNot: null } },
    }

    // Fetch the user action batches that need to be backfilled.
    const userActionBatches = await step.run('script.get-user-actions', async () => {
      const userActions = await prismaClient.userAction.findMany({
        where: whereUserActionToBackfill,
        take: maxBackfillCount,
        include: {
          user: {
            include: { primaryUserCryptoAddress: true },
          },
        },
        orderBy: { datetimeCreated: 'asc' }, // Fetch the oldest user actions first.
      })
      logger.info(`Fetched ${userActions.length} user actions to backfill`)
      return chunk(userActions, BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE)
    })

    // Process the user action batches.
    for (const userActionBatch of userActionBatches) {
      // If there are no more user actions to backfill, stop the cron job.
      if (userActionBatch.length === 0) {
        stopMessage = 'No more user actions to backfill'
        logger.info(`${stopMessage} - stopping the cron job`)
        break
      }

      // Check if the current timestamp has passed the timeframe.
      if (new Date().getTime() > currentTime + BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME) {
        stopMessage = 'Current timestamp has passed the timeframe'
        logger.info(`${stopMessage} - stopping the cron job`)
        break
      }

      // Check if the current wallet balances are low.
      const walletsWithLowBalances = await step.run(
        `script.fetch-current-wallet-balances-${batchNum}`,
        async () => {
          const baseETHBalances = await fetchBaseETHBalances([
            SWC_DOT_ETH_WALLET,
            LEGACY_NFT_DEPLOYER_WALLET,
          ])
          return baseETHBalances.filter(balance => balance.ethValue < LOW_ETH_BALANCE_THRESHOLD)
        },
      )
      if (walletsWithLowBalances && walletsWithLowBalances.length > 0) {
        stopMessage = `Critically low Base ETH balance detected for ${walletsWithLowBalances
          .map(balance => balance.walletAddress)
          .join(', ')}`
        logger.warn(`${stopMessage} - please fund as soon as possible - stopping the cron job`)
        break
      }

      // Check if the current airdrop transaction fee exceeds the threshold.
      const currentAirdropTransactionFee = await step.run(
        `script.fetch-airdrop-transaction-fee-${batchNum}`,
        async () => {
          const fee = await fetchAirdropTransactionFee()
          logger.info(`Current airdrop transaction fee: ${fee}`)
          return fee
        },
      )
      if (currentAirdropTransactionFee > AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) {
        stopMessage = `Current airdrop transaction fee (${currentAirdropTransactionFee}) exceeds the threshold (${AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD})`
        logger.info(`${stopMessage} - stopping the cron job`)
        break
      }

      // Claim the NFT for the user actions.
      await step.run(`script.claim-nfts-${batchNum}`, async () => {
        const results = await Promise.allSettled(
          userActionBatch.map(userAction =>
            claimNFT({
              userAction,
              userCryptoAddress: userAction.user.primaryUserCryptoAddress!,
              countryCode: userAction.user.countryCode as SupportedCountryCodes,
              config: { skipTransactionFeeCheck: true },
            }),
          ),
        )

        const failedClaims = results.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        )

        if (failedClaims.length > 0) {
          logger.warn(
            `${failedClaims.length}/${results.length} NFT claims failed in batch ${batchNum}`,
          )
        }
      })
      batchNum += 1

      // Sleep for the interval duration.
      await step.sleep(
        `script.sleep-${batchNum}`,
        BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL,
      )
    }

    // Fetch the remaining user actions that are in the backlog.
    const userActionsRemaining = await step.run('script.get-user-actions-remaining', async () => {
      return await prismaClient.userAction.count({
        where: whereUserActionToBackfill,
      })
    })

    // Trigger alert if we have user actions missing NFTs whose creation time is greater than `MISSING_NFT_DAYS_ALERT_THRESHOLD`.
    await step.run('script.trigger-alert', async () => {
      const userAction = await prismaClient.userAction.findFirst({
        where: whereUserActionToBackfill,
        orderBy: { datetimeCreated: 'asc' }, // Fetch the oldest user action.
      })
      if (!userAction) {
        return
      }

      if (
        currentTime - new Date(userAction.datetimeCreated).getTime() >
        MISSING_NFT_DAYS_ALERT_THRESHOLD
      ) {
        // Trigger Sentry alert.
        Sentry.captureMessage(
          `Detected old user action that is missing NFT. Please check for Base network congestion and incidents, and adjust variables if needed.`,
          {
            level: 'error',
            extra: {
              currentAirdropTransactionFee: await fetchAirdropTransactionFee(),
              missingNFTDaysAlertThreshold: MISSING_NFT_DAYS_ALERT_THRESHOLD,
              userActionDatetimeCreated: userAction.datetimeCreated,
              userActionId: userAction.id,
            },
          },
        )
      }
    })

    return {
      stopMessage,
      userActionsRemaining: userActionsRemaining,
    }
  },
)
