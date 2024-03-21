import { $Enums, NFTCurrency, UserAction, UserActionType, UserCryptoAddress } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT'
import { inngest } from '@/inngest/inngest'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { AirdropPayload } from '@/utils/server/nft/payload'
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
  UserActionTweetCampaignName,
  UserActionVoterRegistrationCampaignName,
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
  },
  [UserActionType.EMAIL]: { [UserActionEmailCampaignName.DEFAULT]: null },
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
}

const logger = getLogger('claimNft')

interface Config {
  skipTransactionFeeCheck: boolean
}

export async function claimNFT(
  userAction: Pick<UserAction, 'id' | 'actionType' | 'campaignName' | 'nftMintId'>,
  userCryptoAddress: Pick<UserCryptoAddress, 'cryptoAddress'>,
  config: Config = { skipTransactionFeeCheck: false },
) {
  if (!config.skipTransactionFeeCheck) {
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

  const payload: AirdropPayload = {
    nftMintId: action.nftMintId!,
    recipientWalletAddress: userCryptoAddress.cryptoAddress,
    nftSlug,
  }

  return inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: payload,
  })
}
