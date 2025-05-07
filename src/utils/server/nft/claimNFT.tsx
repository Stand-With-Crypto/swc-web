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
  getEmailActiveActionsByCountry,
  getEmailEnabledActionNFTsByCountry,
} from '@/utils/server/email/templates/common/constants'
import { getNFTOnTheWayEmail } from '@/utils/server/email/templates/nftOnTheWay'
import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { prismaClient } from '@/utils/server/prismaClient'
import { fetchAirdropTransactionFee } from '@/utils/server/thirdweb/fetchCurrentClaimTransactionFee'
import { AIRDROP_NFT_ETH_TRANSACTION_FEE_THRESHOLD } from '@/utils/shared/airdropNFTETHTransactionFeeThreshold'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { COUNTRY_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN } from '@/utils/shared/userActionCampaigns'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  USActiveClientUserActionWithCampaignType,
  USUserActionCallCampaignName,
  USUserActionDonationCampaignName,
  USUserActionEmailCampaignName,
  USUserActionLinkedinCampaignName,
  USUserActionLiveEventCampaignName,
  USUserActionNftMintCampaignName,
  USUserActionPollCampaignName,
  USUserActionReferCampaignName,
  USUserActionRsvpEventCampaignName,
  USUserActionTweetAtPersonCampaignName,
  USUserActionTweetCampaignName,
  USUserActionViewKeyPageCampaignName,
  USUserActionViewKeyRacesCampaignName,
  USUserActionVoterAttestationCampaignName,
  USUserActionVoterRegistrationCampaignName,
  USUserActionVotingDayCampaignName,
  USUserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import NFTMintStatus = $Enums.NFTMintStatus

export const ACTION_NFT_SLUG: Record<
  USActiveClientUserActionWithCampaignType,
  Record<string, NFTSlug | null>
> = {
  [UserActionType.OPT_IN]: {
    [UserActionOptInCampaignName.DEFAULT]: NFTSlug.SWC_SHIELD,
  },
  [UserActionType.CALL]: {
    [USUserActionCallCampaignName.DEFAULT]: NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
    [USUserActionCallCampaignName.FIT21_2024_04]: NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
  },
  [UserActionType.EMAIL]: {
    [USUserActionEmailCampaignName.DEFAULT]: null,
    [USUserActionEmailCampaignName.FIT21_2024_04]: null,
  },
  [UserActionType.DONATION]: {
    [USUserActionDonationCampaignName.DEFAULT]: null,
  },
  [UserActionType.NFT_MINT]: {
    [USUserActionNftMintCampaignName.DEFAULT]: null,
  },
  [UserActionType.TWEET]: {
    [USUserActionTweetCampaignName.DEFAULT]: null,
  },
  [UserActionType.VOTER_REGISTRATION]: {
    [USUserActionVoterRegistrationCampaignName.DEFAULT]: NFTSlug.I_AM_A_VOTER,
    [USUserActionVoterRegistrationCampaignName.H1_2025]: null,
  },
  [UserActionType.LIVE_EVENT]: {
    [USUserActionLiveEventCampaignName['2024_03_04_LA']]: NFTSlug.LA_CRYPTO_EVENT_2024_03_04,
  },
  [UserActionType.TWEET_AT_PERSON]: {
    [USUserActionTweetAtPersonCampaignName.DEFAULT]: null,
    [USUserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: NFTSlug.PIZZA_DAY_2024_05_22,
  },
  [UserActionType.VOTER_ATTESTATION]: {
    [USUserActionVoterAttestationCampaignName.DEFAULT]: NFTSlug.VOTER_ATTESTATION,
    [USUserActionVoterAttestationCampaignName.H1_2025]: NFTSlug.VOTER_ATTESTATION,
  },
  [UserActionType.RSVP_EVENT]: {
    [USUserActionRsvpEventCampaignName.DEFAULT]: null,
  },
  [UserActionType.VIEW_KEY_RACES]: {
    [USUserActionViewKeyRacesCampaignName['2024_ELECTION']]: null,
  },
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
    [USUserActionVotingInformationResearchedCampaignName['2024_ELECTION']]: null,
  },
  [UserActionType.VOTING_DAY]: {
    [USUserActionVotingDayCampaignName['2024_ELECTION']]: NFTSlug.I_VOTED,
  },
  [UserActionType.REFER]: {
    [USUserActionReferCampaignName.DEFAULT]: null,
  },
  [UserActionType.POLL]: {
    [USUserActionPollCampaignName.CRYPTO_NEWS]: null,
    [USUserActionPollCampaignName.DIGITAL_ASSETS]: null,
    [USUserActionPollCampaignName.ENCOURAGE]: null,
    [USUserActionPollCampaignName.OVAL_OFFICE]: null,
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    [USUserActionViewKeyPageCampaignName.DEFAULT]: null,
  },
  [UserActionType.LINKEDIN]: {
    [USUserActionLinkedinCampaignName.DEFAULT]: null,
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

export async function claimNFT({
  userAction,
  userCryptoAddress,
  countryCode,
  config = {},
}: {
  userAction: UserActionToClaim
  userCryptoAddress: Pick<UserCryptoAddress, 'cryptoAddress'>
  countryCode: SupportedCountryCodes
  config?: Config
}) {
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
  const activeClientUserActionTypeWithCampaign = COUNTRY_ACTIVE_CLIENT_USER_ACTION_WITH_CAMPAIGN[
    countryCode
  ].find(key => key === userAction.actionType)

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

  if (!nftSlug || !NFT_SLUG_BACKEND_METADATA[nftSlug]) {
    throw new Error(
      `Invalid or missing NFT metadata for action ${actionType} with campaign ${campaignName}`,
    )
  }

  try {
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
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        actionType: userAction.actionType,
        campaignName: userAction.campaignName,
        activeClientUserActionTypeWithCampaign,
        nftSlug,
      },
      tags: {
        domain: 'claimNFT',
      },
      level: 'error',
    })
    logger.error(`Failed to claim NFT: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

export async function claimNFTAndSendEmailNotification({
  userAction,
  userCryptoAddress,
  countryCode,
  config = {},
}: {
  userAction: UserActionToClaim
  userCryptoAddress: Pick<UserCryptoAddress, 'cryptoAddress'>
  countryCode: SupportedCountryCodes
  config?: Config
}) {
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

  return claimNFT({
    userAction,
    userCryptoAddress,
    countryCode,
    config: {
      ...hydratedConfig,
      skipTransactionFeeCheck: true,
    },
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

  const countryCode = user.countryCode as SupportedCountryCodes

  if (
    !user.primaryUserEmailAddress?.emailAddress ||
    !Object.values(getEmailEnabledActionNFTsByCountry(countryCode)).includes(userAction.actionType)
  ) {
    return null
  }

  const userSession = user.userSessions?.[0]

  const NFTOnTheWayEmail = getNFTOnTheWayEmail(countryCode)
  if (!NFTOnTheWayEmail) {
    return null
  }

  const messageId = await sendMail({
    countryCode,
    payload: {
      to: user.primaryUserEmailAddress.emailAddress,
      subject: NFTOnTheWayEmail.subjectLine,
      html: await render(
        <NFTOnTheWayEmail
          actionNFT={userAction.actionType as EmailEnabledActionNFTs}
          completedActionTypes={user.userActions
            .filter(action =>
              Object.values(getEmailActiveActionsByCountry(countryCode)).includes(
                action.actionType,
              ),
            )
            .map(action => action.actionType as EmailActiveActions)}
          countryCode={countryCode}
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
        campaign: NFTOnTheWayEmail.campaign,
      },
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

  logger.info(`Sent nft on the way email with messageId: ${String(messageId)}`)
}
