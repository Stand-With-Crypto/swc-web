import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CALL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { EMAIL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormEmailCongressperson/constants'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import {
  UserActionCallCampaignName,
  UserActionDonationCampaignName,
  UserActionEmailCampaignName,
  UserActionOptInCampaignName,
  UserActionTweetCampaignName,
  UserActionVoterAttestationCampaignName,
  UserActionVoterRegistrationCampaignName,
  UserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory'
import { UserActionFormEmailDebateDialog } from '@/components/app/userActionFormEmailDebate/dialog'

export const USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto',
    description: 'Join over 1,000,000 people fighting to keep crypto in America.',
    campaignsModalDescription: 'Join over 1,000,000 people fighting to keep crypto in America.',
    image: '/actionTypeIcons/optIn.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto',
        description: 'Join over 1,000,000 people fighting to keep crypto in America.',
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  'Prepare to vote': {
    title: 'Prepare to vote',
    description: 'Research candidates, check your voter registration status, and pledge to vote.',
    campaignsModalDescription:
      'Research candidates, check your voter registration status, and pledge to vote.',
    image: '/actionTypeIcons/voterAttestation.png',
    link: ({ children }) => <Link href="/vote">{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.VOTER_ATTESTATION,
        campaignName: UserActionVoterAttestationCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Get informed',
        description: 'See where politicians on your ballot stand on crypto.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: _ => null, // This returns null because the Prepare to vote CTA is a link to the voter registration page
      },
      {
        actionType: UserActionType.VOTER_REGISTRATION,
        campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Check your voter registration',
        description: 'Make sure you’re registered to vote in this year’s election.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: _ => null, // This returns null because the Prepare to vote CTA is a link to the voter registration page
      },
      {
        actionType: UserActionType.VOTING_INFORMATION_RESEARCHED,
        campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
        isCampaignActive: true,
        canBeTriggeredMultipleTimes: true,
        title: 'Prepare to vote',
        description: 'Find your polling location and learn about early voting options.',
        WrapperComponent: _ => null, // This returns null because the Prepare to vote CTA is a link to the voter registration page
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
        campaignName: UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP,
        isCampaignActive: true,
        title: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
        description: 'Make your voice heard. We make it easy.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailCongresspersonDialog,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP,
        isCampaignActive: true,
        title: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
        description: 'Make your voice heard. We make it easy.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailCongresspersonDialog,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024,
        isCampaignActive: false,
        title: `Email ABC`,
        description: 'Make your voice heard. We make it easy.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailDebateDialog,
      },
      {
        actionType: UserActionType.EMAIL,
        campaignName: UserActionEmailCampaignName.FIT21_2024_04_FOLLOW_UP,
        isCampaignActive: true,
        title: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
        description: 'Make your voice heard. We make it easy.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormEmailCongresspersonDialog,
      },
    ],
  },
  [UserActionType.CALL]: {
    title: 'Make a call',
    description: 'Calling is the most effective way to make your voice heard.',
    campaignsModalDescription: 'Calling is the most effective way to make your voice heard.',
    image: '/actionTypeIcons/call.png',
    campaigns: [
      {
        actionType: UserActionType.CALL,
        campaignName: UserActionCallCampaignName.FIT21_2024_04,
        isCampaignActive: true,
        title: `Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`,
        description: "The most effective way to make your voice heard. We'll show you how.",
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormCallCongresspersonDialog,
      },
    ],
  },
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWithCrypto on X.',
    image: '/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: UserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: UserActionFormCallCongresspersonDialog,
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
        isCampaignActive: true,
        title: 'Make a donation',
        description: 'Donate fiat or crypto to help keep crypto in America.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: _ => null, // This returns null because the donate CTA is a link to the donate page,
      },
    ],
  },
}
