import { NFTCurrency, NFTMintStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'
import { NonRetriableError } from 'inngest'

import { onFailureAirdropNFT } from '@/inngest/functions/airdropNFT/onFailureAirdropNFT'
import { inngest } from '@/inngest/inngest'
import { sendMail } from '@/utils/server/email'
import {
  EmailActiveActions,
  NFT_SLUG_TO_EMAIL_ACTIVE_ACTION,
} from '@/utils/server/email/templates/common/constants'
import NFTArrivedEmail from '@/utils/server/email/templates/nftArrived'
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

export const AIRDROP_NFT_INNGEST_EVENT_NAME = 'app/airdrop.request'
const AIRDROP_NFT_INNGEST_FUNCTION_ID = 'airdrop-nft'
const AIRDROP_NFT_RETRY = 2

const WEI_TO_ETH_UNIT = 1e-18

export const airdropNFTWithInngest = inngest.createFunction(
  {
    id: AIRDROP_NFT_INNGEST_FUNCTION_ID,
    retries: AIRDROP_NFT_RETRY,
    onFailure: onFailureAirdropNFT,
  },
  { event: AIRDROP_NFT_INNGEST_EVENT_NAME },
  async ({ event, step, logger }) => {
    const payload = event.data

    const queryId = await step.run('airdrop-NFT', async () => {
      return engineAirdropNFT(payload.nftSlug, payload.recipientWalletAddress, 1)
    })

    let attempt = 1
    let mintStatus: ThirdwebTransactionStatus | null = null
    let transactionHash: string | null
    let transactionFee: Decimal
    let gasLimit = 0
    let gasPrice = 0

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
      gasLimit = Number(transactionStatus.gasLimit)
      gasPrice = Number(transactionStatus.gasPrice) * WEI_TO_ETH_UNIT // Gas price is in wei, so we need to convert it to ETH.
      transactionFee = new Decimal(gasLimit * gasPrice)
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
        const user = await prismaClient.user.findFirstOrThrow({
          where: {
            id: payload.userId,
          },
          include: {
            primaryUserEmailAddress: true,
            userActions: true,
            userSessions: true,
          },
        })
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
        analytics.track('NFT Successfully Airdropped', {
          'NFT Slug': payload.nftSlug,
          'Transaction Fee In USD': transactionFee.mul(ratio).toNumber(),
          'Gas Limit': gasLimit,
          'Gas Price': gasPrice,
        })

        const actionType = NFT_SLUG_TO_EMAIL_ACTIVE_ACTION[payload.nftSlug]
        if (!user.primaryUserEmailAddress?.emailAddress || !actionType) {
          return null
        }
        const userSession = user.userSessions?.[0]

        const messageId = await sendMail({
          to: user.primaryUserEmailAddress.emailAddress,
          subject: NFTArrivedEmail.subjectLine,
          html: render(
            <NFTArrivedEmail
              actionNFT={actionType}
              completedActionTypes={user.userActions
                .filter(action => Object.values(EmailActiveActions).includes(action.actionType))
                .map(action => action.actionType as EmailActiveActions)}
              hiddenActions={[actionType]}
              session={
                userSession
                  ? {
                      userId: userSession.userId,
                      sessionId: userSession.id,
                    }
                  : null
              }
            />,
          ),
          customArgs: {
            userId: user.id,
            actionType,
          },
        }).catch(err => {
          Sentry.captureException(err, {
            extra: { userId: user.id, emailTo: user.primaryUserEmailAddress!.emailAddress },
            tags: {
              domain: 'airdropNFT',
            },
            fingerprint: ['airdropNFT', 'sendMail'],
          })
        })

        await analytics.flush()

        return {
          messageId,
        }
      })
    }
  },
)
