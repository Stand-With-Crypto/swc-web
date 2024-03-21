import { NFTCurrency, NFTMintStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import * as Sentry from '@sentry/nextjs'
import { NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { onFailureAirdropNFT } from '@/inngest/onFailureAirdropNFT'
import { AirdropPayload } from '@/utils/server/nft/payload'
import {
  THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS,
  updateMintNFTStatus,
} from '@/utils/server/nft/updateMintNFTStatus'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { getLocalUserFromUser } from '@/utils/server/serverLocalUser'
import { engineAirdropNFT } from '@/utils/server/thirdweb/engineAirdropNFT'
import {
  engineGetMintStatus,
  THIRDWEB_FINAL_TRANSACTION_STATUSES,
  ThirdwebTransactionStatus,
} from '@/utils/server/thirdweb/engineGetMintStatus'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { getLogger } from '@/utils/shared/logger'

export const AIRDROP_NFT_INNGEST_EVENT_NAME = 'app/airdrop.request'
const AIRDROP_NFT_INNGEST_FUNCTION_ID = 'airdrop-nft'
const AIRDROP_NFT_RETRY = 2

const logger = getLogger('airdropNFTWithInngest')

export const airdropNFTWithInngest = inngest.createFunction(
  {
    id: AIRDROP_NFT_INNGEST_FUNCTION_ID,
    retries: AIRDROP_NFT_RETRY,
    onFailure: onFailureAirdropNFT,
  },
  { event: AIRDROP_NFT_INNGEST_EVENT_NAME },
  async ({ event, step }) => {
    const payload = event.data as AirdropPayload

    const queryId = await step.run('airdrop-NFT', async () => {
      return engineAirdropNFT(payload.nftSlug, payload.recipientWalletAddress, 1)
    })

    let attempt = 1
    let mintStatus: ThirdwebTransactionStatus | null = null
    let transactionHash: string | null
    let transactionFee: Decimal

    while (
      (attempt <= 6 && mintStatus === null) ||
      (attempt <= 6 &&
        mintStatus !== null &&
        !THIRDWEB_FINAL_TRANSACTION_STATUSES.includes(mintStatus))
    ) {
      await step.sleep(`wait-before-checking-status`, `${attempt * 20}s`)
      const transactionStatus = await step.run(`fetch-mint-status`, async () => {
        return await engineGetMintStatus(queryId)
      })

      mintStatus = transactionStatus.status
      transactionHash = transactionStatus.transactionHash
      transactionFee = new Decimal(
        Number(transactionStatus.gasLimit) * Number(transactionStatus.gasPrice),
      )
      attempt += 1
    }

    if (!mintStatus || !THIRDWEB_FINAL_TRANSACTION_STATUSES.includes(mintStatus)) {
      await updateMintNFTStatus(payload.nftMintId, NFTMintStatus.TIMEDOUT, transactionHash!)
      throw new NonRetriableError('cannot get final states of minting request', {
        cause: mintStatus,
      })
    }

    const status = mintStatus! as ThirdwebTransactionStatus

    await step.run('update-nft-status', async () => {
      return await updateMintNFTStatus(
        payload.nftMintId,
        THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS[status],
        transactionHash,
      )
    })

    if (status === 'errored' || status === 'cancelled') {
      throw new NonRetriableError(
        `airdrop NFT transaction ${transactionHash!} failed with status ${status}`,
      )
    }

    if (status === 'mined') {
      await step.run('emit-analytics-event', async () => {
        // All flows to this Inngest function should have passed in the user's primary crypto address.
        const user = await prismaClient.user.findFirst({
          where: {
            primaryUserCryptoAddress: {
              cryptoAddress: payload.recipientWalletAddress,
            },
          },
        })
        if (!user) {
          Sentry.captureMessage(
            'user not found by primary user crypto address - skipping emitting analytics',
            {
              extra: {
                payload,
              },
            },
          )
          return
        }
        const localUser = getLocalUserFromUser(user)
        const analytics = getServerAnalytics({
          localUser,
          userId: user.id,
        })
        const ratio = await getCryptoToFiatConversion(NFTCurrency.ETH)
          .then(res => {
            return res?.data.amount ? res?.data.amount : new Decimal(0)
          })
          .catch(e => {
            logger.error(e)
            return new Decimal(0)
          })
        analytics.track('NFT successfully airdropped', {
          nftSlug: payload.nftSlug,
          transactionFeeUSD: transactionFee.mul(ratio).toNumber(),
        })
      })
    }
  },
)
