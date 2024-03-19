import { UserActionType } from '@prisma/client'
import { chunk } from 'lodash-es'

import { ACTION_NFT_SLUG, claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('backfillNFTCronJob')

// This is the date when SWC went live. We don't want to backfill anything before this date.
const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

// This is the milliseconds to wait before processing the next batch of user actions.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) || 10000 // 10 seconds.

// This is the number of user actions to process in a single batch.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE) || 20

// This is the threshold in which we will stop the cron job if the current transaction fee exceeds the threshold.
const AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD =
  Number(process.env.AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD) || 0.00005

const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME = 4.5 * 60 * 1000 // 4.5 minutes timeframe to backfill the records, leaving 30 seconds before the next run.

/**
 * This function is the main logic for the backfill NFT cron job.
 *
 * The reason why each business logic does NOT have their own individual step function is because the Inngest
 *   step functions return a `JsonifyObject` for objects, which wraps strings around object fields and destroys the original object structure.
 *   I was unable to find a way to return the original object structure from the step function.
 * However, it is still important that the single step function calls all of the business because Inngest will only call
 *   step functions once, but they can call any other code multiple times.
 *   See: https://www.inngest.com/docs/functions/multi-step#my-function-is-running-twice
 *
 * @returns The number of user actions that were backfilled.
 */
export async function executeBackfillNFTCronJobLogic() {
  // Get the current time of when the job is executed.
  const currentTime = new Date().getTime()
  logger.info(`Executing backfill NFT cron job logic`)

  // Calculate the number of user actions to be backfilled using the timeframe, the sleep interval, and the batch size.
  const maxBackfillCount =
    (BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME /
      BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) *
    BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE

  // Fetch the user actions that need to be backfilled.
  const actionsWithNFT: UserActionType[] = Object.entries(ACTION_NFT_SLUG)
    .filter(([_, record]) => record[Object.keys(record)[0]])
    .map(([key]) => UserActionType[key as keyof typeof UserActionType])
  logger.info(`Actions with NFT: ${actionsWithNFT.toString()}`)
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
  logger.info(`Found ${userActions.length} user actions to backfill`)

  let currentBackfillCount = 0
  const userActionBatches = chunk(userActions, BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE)
  // Loop through the user actions and claim the NFTs, one by one, with a delay.
  for (const userActionBatch of userActionBatches) {
    if (userActionBatch.length === 0) {
      logger.info(`No more user actions to backfill - stopping the cron job`)
      break
    }

    // If the current time has already passed the timeframe, then break.
    if (new Date().getTime() > currentTime + BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME) {
      logger.info(`Current timestamp has passed the timeframe - stopping the cron job`)
      break
    }

    // Fetch the current transaction fee and compare the fee with the threshold.
    const currentAirdropTransactionFee = await fetchAirdropTransactionFee()
    logger.info(`Current airdrop transaction fee: ${currentAirdropTransactionFee}`)
    if (currentAirdropTransactionFee > AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD) {
      logger.info(
        `Current airdrop transaction fee (${currentAirdropTransactionFee}) exceeds the threshold (${AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD}) - stopping the cron job`,
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
    currentBackfillCount += userActionBatch.length

    // Sleep for the interval duration.
    await new Promise(resolve =>
      setTimeout(resolve, BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL),
    )
  }

  logger.info(`Backfilled ${currentBackfillCount} user actions`)
  return currentBackfillCount
}
