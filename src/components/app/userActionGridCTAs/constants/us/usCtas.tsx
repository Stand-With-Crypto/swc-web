import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CALL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { getEmailActionWrapperComponentByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getWrapperComponentByCampaignName'
import { UserActionFormEmailDebateDialog } from '@/components/app/userActionFormEmailDebate/dialog'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  USUserActionCallCampaignName,
  USUserActionDonationCampaignName,
  USUserActionEmailCampaignName,
  USUserActionPollCampaignName,
  USUserActionReferCampaignName,
  USUserActionTweetCampaignName,
  USUserActionVoterAttestationCampaignName,
  USUserActionVoterRegistrationCampaignName,
  USUserActionVotingDayCampaignName,
  USUserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory/us'

const countryCode = SupportedCountryCodes.US
const urls = getIntlUrls(countryCode)

export const US_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto',
    description: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
    mobileCTADescription: 'Join the fight to keep crypto in America.',
    campaignsModalDescription: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
    image: '/actionTypeIcons/optIn.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto',
        description: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.EMAIL]: {
    title: 'Email your House Rep',
    description: 'Support Market Structure Regulation (CLARITY Act)',
    campaignsModalDescription:
      'One of the most effective ways of making your voice heard. We’ve drafted emails to make it easy for you.',
    image: '/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025,
        isCampaignActive: true,
        title: 'Email your House Rep',
        description: 'Support Market Structure Regulation (CLARITY Act)',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.GENIUS_ACT_MAY_13_2025,
        isCampaignActive: false,
        title: 'Email your Senator',
        description: 'Support Stablecoin Regulation (GENIUS Act)',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: USUserActionEmailCampaignName.GENIUS_ACT_MAY_13_2025,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.DEFAULT,
        isCampaignActive: false,
        title: `Email your ${getYourPoliticianCategoryShortDisplayName('house')}`,
        description: 'You emailed your representative about FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: USUserActionEmailCampaignName.DEFAULT,
        }),
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'FIT21 Email Campaign',
        description: 'You emailed your representative and asked them to vote YES on FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.FIT21_2024_04,
        isCampaignActive: false,
        title: 'FIT21 Email Campaign',
        description: 'You emailed your representative and asked them to vote YES on FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024,
        isCampaignActive: false,
        title: 'CNN Presidential Debate 2024',
        description: "You emailed CNN and asked them to include the candidates' stance on crypto.",
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024,
        isCampaignActive: false,
        title: 'ABC Presidential Debate 2024',
        description: "You emailed ABC and asked them to include the candidates' stance on crypto.",
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailDebateDialog,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.SEC_COMMISSIONER_2024,
        isCampaignActive: false,
        title: 'Email Your Senator',
        description: 'Told your Senator you oppose anti-crypto commissioners on the SEC.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.WELCOME_119_CONGRESS_2025,
        isCampaignActive: false,
        title: 'Contacted and welcomed the 119 congress',
        description: 'The 119th Congress needs to hear from you!',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3,
        isCampaignActive: false,
        title: 'Contact your Member of Congress',
        description: 'Tell your senator to sign the discharge petition',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3_MARCH_3RD,
        isCampaignActive: false,
        title: 'Contact your Member of Congress',
        description: 'Tell your Senator to Vote “Yes” for S.J.Res.3.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.BROKER_REPORTING_RULE_SJ_RES_3_MARCH_10TH,
        isCampaignActive: false,
        title: 'Contact your Member of Congress',
        description: 'Tell your Member to Vote “Yes” for H.J.Res.25.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.GENIUS_ACT_8_MAY_2025,
        isCampaignActive: false,
        title: 'Contact your Senator',
        description: 'Tell your Senator to Vote “Yes” on opening debate on the GENIUS Act.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025,
        isCampaignActive: false,
        title: 'Email Your Member of Congress',
        description: 'Support Crucial Crypto Legislation',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025,
        }),
      },
    ],
  },
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    image: '/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: USUserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={SupportedCountryCodes.US}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
      {
        actionType: UserActionType.TWEET,
        campaignName: USUserActionTweetCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'Tweet Campaign',
        description: 'You helped bring more advocates to the cause by tweeting about SWC.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={SupportedCountryCodes.US}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  },
  [UserActionType.VOTING_DAY]: {
    title: 'I voted!',
    description: 'Claim your "proof-of-vote" NFT.',
    mobileCTADescription: 'Claim your "proof-of-vote" NFT.',
    campaignsModalDescription: 'Claim your "proof-of-vote" NFT.',
    image: '/actionTypeIcons/iVoted.png',
    campaigns: [
      {
        actionType: UserActionType.VOTING_DAY,
        campaignName: USUserActionVotingDayCampaignName['H1_2025'],
        isCampaignActive: false,
        title: 'I voted!',
        description: 'Claimed your "proof-of-vote" NFT.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.DONATION]: {
    title: 'Make a donation',
    description: 'Donate fiat or crypto to help keep crypto in America.',
    campaignsModalDescription: 'Donate fiat or crypto to help keep crypto in America.',
    image: '/actionTypeIcons/donate.png',
    link: ({ children }) => <Link href={urls.donate()}>{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.DONATION,
        campaignName: USUserActionDonationCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Make a donation',
        description: 'Donate fiat or crypto to help keep crypto in America.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null, // This is null because the donate CTA is a link to the donate page,
      },
    ],
  },
  [UserActionType.CALL]: {
    title: 'Make a call',
    description: 'Calling is the most effective way to make your voice heard.',
    mobileCTADescription: 'The most effective way to make your voice heard.',
    campaignsModalDescription: 'Calling is the most effective way to make your voice heard.',
    image: '/actionTypeIcons/call.png',
    campaigns: [
      {
        actionType: UserActionType.CALL,
        campaignName: USUserActionCallCampaignName.FIT21_2024_04,
        isCampaignActive: false, // FALSE UNTIL THE 2024 ELECTION IS OVER
        title: `Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`,
        // description: "The most effective way to make your voice heard. We'll show you how.", // TODO: RETURN TO THIS DESCRIPTION AFTER THE 2024 ELECTION IS OVER
        description: `You called your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })} about FIT21`,
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormCallCongresspersonDialog,
      },
      {
        actionType: UserActionType.CALL,
        campaignName: USUserActionCallCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'FIT21 Call Campaign',
        description: 'You called your representative and asked them to vote YES on FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.VOTER_ATTESTATION]: {
    title: 'Get informed',
    description: 'See where your politicians stand on crypto.',
    mobileCTADescription: 'See where your politicians stand on crypto.',
    campaignsModalDescription: 'See where your politicians stand on crypto.',
    image: '/actionTypeIcons/optIn.png', // Yeah, we are using the join icon here while we only have these 3 CTAs active
    campaigns: [
      {
        actionType: UserActionType.VOTER_ATTESTATION,
        campaignName: USUserActionVoterAttestationCampaignName['H1_2025'],
        isCampaignActive: false,
        title: 'Get informed',
        description: 'See where your politicians stand on crypto.',
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.VOTER_REGISTRATION]: {
    title: 'Check your voter registration',
    description: 'Make sure you’re registered to vote in this year’s election.',
    mobileCTADescription: 'Make sure you’re registered to vote in this year’s election.',
    campaignsModalDescription: 'Make sure you’re registered to vote in this year’s election.',
    image: '/actionTypeIcons/voterAttestation.png',
    campaigns: [
      {
        actionType: UserActionType.VOTER_REGISTRATION,
        campaignName: USUserActionVoterRegistrationCampaignName['H1_2025'],
        isCampaignActive: false,
        title: 'Check your voter registration',
        description: 'Make sure you’re registered to vote in this year’s election.',
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.VOTING_INFORMATION_RESEARCHED]: {
    title: 'Prepare to vote',
    description: 'Find your polling location and learn about early voting options.',
    mobileCTADescription: 'Find your polling location and learn about early voting options.',
    campaignsModalDescription: 'Find your polling location and learn about early voting options.',
    image: '/actionTypeIcons/votingResearched.png',
    campaigns: [
      {
        actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
        campaignName: USUserActionVotingInformationResearchedCampaignName['H1_2025'],
        isCampaignActive: false,
        canBeTriggeredMultipleTimes: false,
        title: 'Prepare to vote',
        description: 'Find your polling location and learn about early voting options.',
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.POLL]: {
    title: 'Take the poll',
    description: 'Take the poll and see the results.',
    mobileCTADescription: 'Take the poll and see the results.',
    campaignsModalDescription: 'Take the poll and see the results.',
    image: '/actionTypeIcons/voterAttestation.png',
    link: ({ children }) => <Link href={urls.polls()}>{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.POLL,
        campaignName: USUserActionPollCampaignName.CRYPTO_NEWS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: USUserActionPollCampaignName.DIGITAL_ASSETS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: USUserActionPollCampaignName.ENCOURAGE,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: USUserActionPollCampaignName.OVAL_OFFICE,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.REFER]: {
    title: 'Refer a Friend',
    description: 'Get your friend to signup for Stand With Crypto and verify their account.',
    mobileCTADescription:
      'Get your friend to signup for Stand With Crypto and verify their account.',
    campaignsModalDescription: 'Share your referral link with friends to help grow our movement.',
    image: '/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName: USUserActionReferCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Refer a Friend',
        description: 'You have referred friends to join Stand With Crypto.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper
            authenticatedContent={
              <UserActionFormReferDialog countryCode={countryCode}>
                {children}
              </UserActionFormReferDialog>
            }
          >
            {children}
          </LoginDialogWrapper>
        ),
      },
    ],
  },
}
