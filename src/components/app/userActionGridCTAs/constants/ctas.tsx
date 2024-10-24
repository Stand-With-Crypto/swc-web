import { Suspense } from 'react'
import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { KeyRacesDialog } from '@/components/app/pageVoterGuide/keyRacesDialog'
import { CALL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { EMAIL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormEmailCongressperson/constants'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormEmailDebateDialog } from '@/components/app/userActionFormEmailDebate/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionFormVotingInformationResearchedDialog } from '@/components/app/userActionFormVotingInformationResearched/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { UserActionVotingDayDialog } from '@/components/app/userActionVotingDay/dialog'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  UserActionCallCampaignName,
  UserActionDonationCampaignName,
  UserActionEmailCampaignName,
  UserActionOptInCampaignName,
  UserActionTweetCampaignName,
  UserActionVoterAttestationCampaignName,
  UserActionVoterRegistrationCampaignName,
  UserActionVotingDayCampaignName,
  UserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory'

export const USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.VOTER_ATTESTATION]: {
    title: 'Get informed',
    description: 'See where your politicians stand on crypto.',
    mobileCTADescription: 'See where your politicians stand on crypto.',
    campaignsModalDescription: 'See where your politicians stand on crypto.',
    image: '/actionTypeIcons/optIn.png', // Yeah, we are using the join icon here while we only have these 3 CTAs active
    campaigns: [
      {
        actionType: UserActionType.VOTER_ATTESTATION,
        campaignName: UserActionVoterAttestationCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Get informed',
        description: 'See where your politicians stand on crypto.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => {
          return (
            <Suspense fallback={children}>
              <KeyRacesDialog>{children}</KeyRacesDialog>
            </Suspense>
          )
        },
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
        campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Check your voter registration',
        description: 'Make sure you’re registered to vote in this year’s election.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormVoterRegistrationDialog,
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
        campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
        isCampaignActive: true,
        canBeTriggeredMultipleTimes: true,
        title: 'Prepare to vote',
        description: 'Find your polling location and learn about early voting options.',
        WrapperComponent: ({ children }) => {
          return (
            <Suspense fallback={children}>
              <UserActionFormVotingInformationResearchedDialog
                initialValues={{
                  campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
                  address: undefined,
                  shouldReceiveNotifications: false,
                }}
              >
                {children}
              </UserActionFormVotingInformationResearchedDialog>
            </Suspense>
          )
        },
      },
    ],
  },
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
        isCampaignActive: false, // FALSE UNTIL THE 2024 ELECTION IS OVER
        title: 'Join Stand With Crypto',
        // description: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`, // TODO: RETURN TO THIS DESCRIPTION AFTER THE 2024 ELECTION IS OVER
        description: `Joined over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.EMAIL]: {
    title: 'Send an email',
    description: 'Email your representatives and tell them crypto matters.',
    campaignsModalDescription:
      'One of the most effective ways of making your voice heard. We’ve drafted emails to make it easy for you.',
    image: '/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.EMAIL,
        campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.EMAIL,
        isCampaignActive: false, // FALSE UNTIL THE 2024 ELECTION IS OVER
        title: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
        // description: 'Make your voice heard. We make it easy.', // TODO: RETURN THIS DESCRIPTION AFTER THE 2024 ELECTION IS OVER
        description: 'You emailed your representative about FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailCongresspersonDialog,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'FIT21 Email Campaign',
        description: 'You emailed your representative and asked them to vote YES on FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.FIT21_2024_04,
        isCampaignActive: false,
        title: 'FIT21 Email Campaign',
        description: 'You emailed your representative and asked them to vote YES on FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024,
        isCampaignActive: false,
        title: 'CNN Presidential Debate 2024',
        description: "You emailed CNN and asked them to include the candidates' stance on crypto.",
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024,
        isCampaignActive: false,
        title: 'ABC Presidential Debate 2024',
        description: "You emailed ABC and asked them to include the candidates' stance on crypto.",
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailDebateDialog,
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
        campaignName: UserActionCallCampaignName.FIT21_2024_04,
        isCampaignActive: false, // FALSE UNTIL THE 2024 ELECTION IS OVER
        title: `Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`,
        // description: "The most effective way to make your voice heard. We'll show you how.", // TODO: RETURN TO THIS DESCRIPTION AFTER THE 2024 ELECTION IS OVER
        description: `You called your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })} about FIT21`,
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormCallCongresspersonDialog,
      },
      {
        actionType: UserActionType.CALL,
        campaignName: UserActionCallCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'FIT21 Call Campaign',
        description: 'You called your representative and asked them to vote YES on FIT21.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
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
        campaignName: UserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
        isCampaignActive: false, // FALSE UNTIL THE 2024 ELECTION IS OVER
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormShareOnTwitterDialog,
      },
      {
        actionType: UserActionType.TWEET,
        campaignName: UserActionTweetCampaignName.DEFAULT,
        isCampaignActive: false,
        title: 'Tweet Campaign',
        description: 'You helped bring more advocates to the cause by tweeting about SWC.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormShareOnTwitterDialog,
      },
    ],
  },
  [UserActionType.DONATION]: {
    title: 'Make a donation',
    description: 'Donate fiat or crypto to help keep crypto in America.',
    campaignsModalDescription: 'Donate fiat or crypto to help keep crypto in America.',
    image: '/actionTypeIcons/donate.png',
    link: ({ children }) => <Link href="/donate">{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.DONATION,
        campaignName: UserActionDonationCampaignName.DEFAULT,
        isCampaignActive: false, // FALSE UNTIL THE 2024 ELECTION IS OVER
        title: 'Make a donation',
        description: 'Donate fiat or crypto to help keep crypto in America.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null, // This is null because the donate CTA is a link to the donate page,
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
        campaignName: UserActionVotingDayCampaignName['2024_ELECTION'],
        isCampaignActive: true,
        title: 'I voted!',
        description: 'Claim your "proof-of-vote" NFT.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <Suspense fallback={children}>
            <UserActionVotingDayDialog>{children}</UserActionVotingDayDialog>
          </Suspense>
        ),
      },
    ],
  },
}
