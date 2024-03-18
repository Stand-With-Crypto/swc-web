import { UserActionType } from '@prisma/client'

import { ACTION_NFT_SLUG, claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('backfillNFTCronJob')

// This is the date when SWC went live. We don't want to backfill anything before this date.
const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

// This is the number of records to process in a single run.
const BACKFILL_NFT_INNGEST_CRON_JOB_PROCESS_SIZE =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_PROCESS_SIZE) || 1000

// This is the threshold in which we will stop the cron job if the current transaction fee exceeds the threshold.
const AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD =
  Number(process.env.AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD) || 0.00005

const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME = 18 * 60 * 1000 // 18 minute timeframe to backfill the records, leaving 2 minutes for the network to settle.

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
    take: BACKFILL_NFT_INNGEST_CRON_JOB_PROCESS_SIZE,
    include: {
      user: {
        include: { primaryUserCryptoAddress: true },
      },
    },
  })
  logger.info(`Found ${userActions.length} user actions to backfill`)

  // Calculate the interval duration in milliseconds.
  const interval =
    BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME / BACKFILL_NFT_INNGEST_CRON_JOB_PROCESS_SIZE
  logger.info(`Airdropping NFTs with an interval of ${interval} milliseconds`)

  // Loop through the user actions and claim the NFTs, one by one, with a delay.
  for (const userAction of userActions) {
    // If the current time has already passed the timeframe, then break.
    if (new Date().getTime() > currentTime + BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_TIMEFRAME) {
      logger.info(`Current timestamp has passed the timeframe - stopping the cron job`)
      break
    }

    // Fetch the current transaction fee and compare it with the threshold.
    const currentAirdropTransactionFee = await fetchAirdropTransactionFee()
    logger.info(`Current airdrop transaction fee: ${currentAirdropTransactionFee}`)
    if (currentAirdropTransactionFee > AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD) {
      logger.info(
        `Current airdrop transaction fee (${currentAirdropTransactionFee}) exceeds the threshold (${AIRDROP_NFT_TRANSACTION_FEE_THRESHOLD}) - stopping the cron job`,
      )
      break
    }

    // Claim the NFT for the user action.
    await claimNFT(userAction, userAction.user.primaryUserCryptoAddress!, {
      ignoreTurnOffNFTMintFlag: true,
    })

    // Sleep for the interval duration.
    await new Promise(resolve => setTimeout(resolve, interval))
  }

  logger.info(`Backfilled ${userActions.length} user actions`)
  return userActions.length
}
