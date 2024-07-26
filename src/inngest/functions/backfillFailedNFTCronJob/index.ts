import { NFTMintStatus } from '@prisma/client'
import { chunk } from 'lodash-es'

import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT/airdropNFT'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'
import { LEGACY_NFT_DEPLOYER_WALLET, SWC_DOT_ETH_WALLET } from '@/utils/server/nft/constants'
import { AirdropPayload } from '@/utils/server/nft/payload'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchBaseETHBalances } from '@/utils/server/thirdweb/fetchBaseETHBalances'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD } from '@/utils/shared/airdropNFTETHTransactionFeeThreshold'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'

// This is the milliseconds to wait before processing the next batch of user actions.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL) || 10000 // 10 seconds.

// This is the number of user actions to process in a single batch.
const BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE =
  Number(process.env.BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE) || 20

const BACKFILL_FAILED_NFT_INNGEST_FUNCTION_ID = 'script.backfill-failed-nft-cron-job'
const BACKFILL_FAILED_NFT_INNGEST_EVENT_NAME = 'script/backfill.failed.nft.cron.job'

const LOW_ETH_BALANCE_THRESHOLD = 0.01

const logger = getLogger('backfillFailedNFTCronJob')

interface BackfillFailedNFTPayload {
  limit?: number
}

export const backfillFailedNFT = inngest.createFunction(
  {
    id: BACKFILL_FAILED_NFT_INNGEST_FUNCTION_ID,
    retries: 0,
    concurrency: 1,
    onFailure: onScriptFailure,
  },
  {
    event: BACKFILL_FAILED_NFT_INNGEST_EVENT_NAME,
  },
  async ({ step, event }) => {
    const { limit } = event.data as BackfillFailedNFTPayload

    const failedMintsBatches = await step.run('script.fetch-failed-mints', async () => {
      const failedMints = await prismaClient.nFTMint.findMany({
        where: {
          status: {
            in: [NFTMintStatus.FAILED, NFTMintStatus.TIMEDOUT],
          },
        },
        take: limit,
        include: {
          userActions: {
            select: {
              user: {
                include: {
                  primaryUserCryptoAddress: true,
                },
              },
            },
          },
        },
      })
      logger.info(`Fetched ${failedMints.length} failed mints to backfill`)
      return chunk(failedMints, BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_BATCH_SIZE)
    })

    let batchNum = 1
    let stopMessage

    for (const failedMintsBatch of failedMintsBatches) {
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

      await step.run('script.claim-nfts', () =>
        Promise.all(
          failedMintsBatch.map(mint => {
            const user = mint.userActions[0].user

            if (!user || !user.primaryUserCryptoAddress) return

            const payload: AirdropPayload = {
              nftMintId: mint.id,
              nftSlug: mint.nftSlug as NFTSlug,
              userId: user.id,
              recipientWalletAddress: user.primaryUserCryptoAddress.cryptoAddress,
            }

            return inngest.send({
              name: AIRDROP_NFT_INNGEST_EVENT_NAME,
              payload,
            })
          }),
        ),
      )

      batchNum += 1

      // Sleep for the interval duration.
      await step.sleep(
        `script.sleep-${batchNum}`,
        BACKFILL_NFT_INNGEST_CRON_JOB_AIRDROP_SLEEP_INTERVAL,
      )
    }
  },
)
