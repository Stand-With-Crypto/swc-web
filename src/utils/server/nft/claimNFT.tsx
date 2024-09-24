import {
  $Enums,
  NFTCurrency,
  NFTMintType,
  UserAction,
  UserActionType,
  UserCryptoAddress,
} from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { render } from '@react-email/components'
import * as Sentry from '@sentry/nextjs'

import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT/airdropNFT'
import { inngest } from '@/inngest/inngest'
import { sendMail } from '@/utils/server/email'
import {
  EmailActiveActions,
  EmailEnabledActionNFTs,
} from '@/utils/server/email/templates/common/constants'
import NFTOnTheWayEmail from '@/utils/server/email/templates/nftOnTheWay'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD } from '@/utils/shared/airdropNFTETHTransactionFeeThreshold'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import {
  ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN,
  ActiveClientUserActionWithCampaignType,
  UserActionCallCampaignName,
  UserActionDonationCampaignName,
  UserActionEmailCampaignName,
  UserActionLiveEventCampaignName,
  UserActionNftMintCampaignName,
  UserActionOptInCampaignName,
  UserActionRsvpEventCampaignName,
  UserActionTweetAtPersonCampaignName,
  UserActionTweetCampaignName,
  UserActionViewKeyRacesCampaignName,
  UserActionVoterAttestationCampaignName,
  UserActionVoterRegistrationCampaignName,
  UserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns'

import NFTMintStatus = $Enums.NFTMintStatus

export const ACTION_NFT_SLUG: Record<
  ActiveClientUserActionWithCampaignType,
  Record<string, NFTSlug | null>
> = {
  [UserActionType.OPT_IN]: {
    [UserActionOptInCampaignName.DEFAULT]: NFTSlug.SWC_SHIELD,
  },
  [UserActionType.CALL]: {
    [UserActionCallCampaignName.DEFAULT]: NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
    [UserActionCallCampaignName.FIT21_2024_04]: NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
  },
  [UserActionType.EMAIL]: {
    [UserActionEmailCampaignName.DEFAULT]: null,
    [UserActionEmailCampaignName.FIT21_2024_04]: null,
  },
  [UserActionType.DONATION]: {
    [UserActionDonationCampaignName.DEFAULT]: null,
  },
  [UserActionType.NFT_MINT]: {
    [UserActionNftMintCampaignName.DEFAULT]: null,
  },
  [UserActionType.TWEET]: {
    [UserActionTweetCampaignName.DEFAULT]: null,
  },
  [UserActionType.VOTER_REGISTRATION]: {
    [UserActionVoterRegistrationCampaignName.DEFAULT]: NFTSlug.I_AM_A_VOTER,
  },
  [UserActionType.LIVE_EVENT]: {
    [UserActionLiveEventCampaignName['2024_03_04_LA']]: NFTSlug.LA_CRYPTO_EVENT_2024_03_04,
  },
  [UserActionType.TWEET_AT_PERSON]: {
    [UserActionTweetAtPersonCampaignName.DEFAULT]: null,
    [UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: NFTSlug.PIZZA_DAY_2024_05_22,
  },
  [UserActionType.VOTER_ATTESTATION]: {
    [UserActionVoterAttestationCampaignName.DEFAULT]: NFTSlug.VOTER_ATTESTATION,
  },
  [UserActionType.RSVP_EVENT]: {
    [UserActionRsvpEventCampaignName.DEFAULT]: null,
  },
  [UserActionType.VIEW_KEY_RACES]: {
    [UserActionViewKeyRacesCampaignName['2024_ELECTION']]: null,
  },
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
    [UserActionVotingInformationResearchedCampaignName['2024_ELECTION']]: null,
  },
}

const logger = getLogger('claimNft')

interface Config {
  skipTransactionFeeCheck?: boolean
}

type UserActionToClaim = Pick<
  UserAction,
  'id' | 'actionType' | 'campaignName' | 'nftMintId' | 'userId'
>

export async function claimNFT(
  userAction: UserActionToClaim,
  userCryptoAddress: Pick<UserCryptoAddress, 'cryptoAddress'>,
  config: Config = {},
) {
  const hydratedConfig = {
    skipTransactionFeeCheck: false,
    ...config,
  }
  if (!hydratedConfig.skipTransactionFeeCheck) {
    const currentTransactionFee = await fetchAirdropTransactionFee()
    if (currentTransactionFee > AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) {
      logger.info(
        `Current transaction fee (${currentTransactionFee}) exceeds threshold (${AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD}) - skipping live NFT airdrop for now.`,
      )
      return null
    }
  }

  logger.info('Function triggered')

  const { actionType, campaignName } = userAction
  const activeClientUserActionTypeWithCampaign = ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN.find(
    key => key === userAction.actionType,
  )

  if (!activeClientUserActionTypeWithCampaign) {
    throw Error(`Action ${userAction.actionType} doesn't have an active campaign.`)
  }

  const nftSlug = ACTION_NFT_SLUG[activeClientUserActionTypeWithCampaign][campaignName]
  if (nftSlug === null) {
    throw Error(`Action ${actionType} for campaign ${campaignName} doesn't have an NFT slug.`)
  }

  if (userAction.nftMintId !== null) {
    throw Error(`Action ${userAction.id} for campaign ${campaignName} already has an NFT mint.`)
  }

  const action = await prismaClient.userAction.update({
    where: { id: userAction.id },
    data: {
      nftMint: {
        create: {
          nftSlug: nftSlug,
          mintType: NFTMintType.SWC_AIRDROPPED,
          status: NFTMintStatus.REQUESTED,
          costAtMint: 0.0,
          contractAddress: NFT_SLUG_BACKEND_METADATA[nftSlug].contractAddress,
          costAtMintCurrencyCode: NFTCurrency.ETH,
          costAtMintUsd: new Decimal(0),
        },
      },
    },
    include: {
      nftMint: true,
    },
  })

  return inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: {
      nftMintId: action.nftMintId!,
      nftSlug,
      recipientWalletAddress: userCryptoAddress.cryptoAddress,
      userId: action.userId,
    },
  })
}

export async function claimNFTAndSendEmailNotification(
  userAction: UserActionToClaim,
  userCryptoAddress: Pick<UserCryptoAddress, 'cryptoAddress'>,
  config: Config = {},
) {
  const hydratedConfig = {
    skipTransactionFeeCheck: false,
    ...config,
  }

  if (!hydratedConfig.skipTransactionFeeCheck) {
    const currentTransactionFee = await fetchAirdropTransactionFee()
    if (currentTransactionFee > AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD) {
      await sendNFTOnTheWayEmail(userAction)
      return null
    }
  }

  return claimNFT(userAction, userCryptoAddress, {
    ...hydratedConfig,
    skipTransactionFeeCheck: true,
  })
}

async function sendNFTOnTheWayEmail(userAction: UserActionToClaim) {
  const user = await prismaClient.user.findFirstOrThrow({
    where: { id: userAction.userId },
    include: {
      primaryUserEmailAddress: true,
      userActions: true,
      userSessions: true,
    },
  })

  if (
    !user.primaryUserEmailAddress?.emailAddress ||
    !Object.values(EmailEnabledActionNFTs).includes(userAction.actionType)
  ) {
    return null
  }

  const userSession = user.userSessions?.[0]
  const messageId = await sendMail({
    to: user.primaryUserEmailAddress.emailAddress,
    subject: NFTOnTheWayEmail.subjectLine,
    html: render(
      <NFTOnTheWayEmail
        actionNFT={userAction.actionType as EmailEnabledActionNFTs}
        completedActionTypes={user.userActions
          .filter(action => Object.values(EmailActiveActions).includes(action.actionType))
          .map(action => action.actionType as EmailActiveActions)}
        hiddenActions={[userAction.actionType]}
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
      userActionId: userAction.id,
      actionType: userAction.actionType,
    },
  }).catch(err => {
    Sentry.captureException(err, {
      extra: { userId: user.id, emailTo: user.primaryUserEmailAddress!.emailAddress },
      tags: {
        domain: 'claimNFT',
      },
      fingerprint: ['claimNFT', 'sendMail'],
    })
    throw err
  })

  logger.info(`Sent nft on the way email with messageId: ${messageId}`)
}
