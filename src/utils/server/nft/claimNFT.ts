import { $Enums, NFTCurrency, UserAction, UserActionType, UserCryptoAddress } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { error } from 'winston'

import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT'
import { inngest } from '@/inngest/inngest'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { AirdropPayload } from '@/utils/server/nft/payload'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import {
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

export const ACTION_NFT_SLUG: Record<UserActionType, Record<string, NFTSlug | null>> = {
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
    // Add NFT slugs for live event in a follow-up
    [UserActionLiveEventCampaignName['2024_03_04_LA']]: null,
  },
}

const logger = getLogger('claimNft')

export async function claimNFT(userAction: UserAction, userCryptoAddress: UserCryptoAddress) {
  logger.info('Triggered')
  const { actionType, campaignName } = userAction

  const nftSlug: NFTSlug | null = ACTION_NFT_SLUG[actionType][campaignName]
  console.log('campaignName', campaignName)
  console.log('nftSlug', nftSlug)
  if (nftSlug === null) {
    throw error(`Action ${actionType} for campaign ${campaignName} doesn't have an NFT slug.`)
  }

  if (userAction.nftMintId !== null) {
    throw error(`Action ${userAction.id} for campaign ${campaignName} already has an NFT mint.`)
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
