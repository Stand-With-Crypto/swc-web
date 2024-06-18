'use client'

import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CALL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCNNDialog } from '@/components/app/userActionFormEmailCNN/dialog'
import { EMAIL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormEmailCongressperson/constants'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { InternalLink } from '@/components/ui/link'
import { useLocale } from '@/hooks/useLocale'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  UserActionEmailCampaignName,
} from '@/utils/shared/userActionCampaigns'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory'

export const USER_ACTION_ROW_CTA_INFO: Record<
  ActiveClientUserActionType,
  Omit<UserActionRowCTAProps, 'state'>
> = {
  [UserActionType.OPT_IN]: {
    actionType: UserActionType.OPT_IN,
    image: { src: '/actionTypeIcons/optIn.png' },
    text: 'Join Stand With Crypto',
    subtext: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
    shortText: 'Join Stand With Crypto',
    shortSubtext: 'Join the movement to keep crypto in America.',
    canBeTriggeredMultipleTimes: false,
    WrapperComponent: ({ children }) => (
      <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
    ),
  },
  [UserActionType.VOTER_REGISTRATION]: {
    actionType: UserActionType.VOTER_REGISTRATION,
    image: {
      src: '/actionTypeIcons/registerToVote.png',
      width: 80,
      height: 80,
      sizes: '(max-width: 768px) 80px, 100px',
      className: 'object-cover w-full h-full',
    },
    text: 'Check your voter registration and get a free NFT',
    subtext:
      'You can make a difference this year. Register to vote and get a free "I\'m a Voter" NFT',
    shortText: 'Register to vote',
    shortSubtext: 'Get a free "I\'m a Voter" NFT',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormVoterRegistrationDialog,
  },
  [UserActionType.CALL]: {
    actionType: UserActionType.CALL,
    image: { src: '/actionTypeIcons/call.png' },
    text: `Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`,
    subtext: "The most effective way to make your voice heard. We'll show you how.",
    shortText: 'Make a call',
    shortSubtext: 'Call your senator and tell them crypto matters.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormCallCongresspersonDialog,
  },
  [UserActionType.EMAIL]: {
    actionType: UserActionType.EMAIL,
    image: { src: '/actionTypeIcons/email.png' },
    text: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
    subtext: "Follow-up your call with an email. We'll make it simple.",
    shortText: 'Send an email',
    shortSubtext: 'We drafted one for you. All you have to do is hit send.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormEmailCongresspersonDialog,
  },
  [UserActionType.DONATION]: {
    actionType: UserActionType.DONATION,
    image: { src: '/actionTypeIcons/donate.png' },
    text: 'Donate to Stand With Crypto',
    subtext: "Support Stand with Crypto's aim to mobilize 52 million crypto advocates in the US.",
    shortText: 'Make a donation',
    shortSubtext: 'Donate fiat or crypto to support the mission.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: ({ children }) => {
      const locale = useLocale()
      return (
        <InternalLink
          className="block text-fontcolor hover:no-underline"
          href={getIntlUrls(locale).donate()}
        >
          {children}
        </InternalLink>
      )
    },
  },
  [UserActionType.TWEET]: {
    actionType: UserActionType.TWEET,
    image: {
      src: '/actionTypeIcons/share.svg',
      width: 40,
      height: 40,
      sizes: '(max-width: 768px) 40px, 50px',
      className: 'object-cover lg:h-[50px] lg:w-[50px]',
    },
    text: 'Spread the word on X',
    subtext: 'Tweet #StandWithCrypto and help bring more advocates to the cause.',
    shortText: 'Share on X',
    shortSubtext: 'Bring more people to the movement.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormShareOnTwitterDialog,
  },
  [UserActionType.NFT_MINT]: {
    actionType: UserActionType.NFT_MINT,
    image: { src: '/actionTypeIcons/mintNFT.png' },
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    shortText: 'Mint your NFT',
    shortSubtext: 'All mint proceeds are donated to the movement.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormNFTMintDialog,
  },
}

export const USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN: Record<
  string,
  Omit<UserActionRowCTAProps, 'state'>
> = {
  [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: {
    actionType: UserActionType.EMAIL,
    image: {
      src: '/actionTypeIcons/email-cnn.svg',
    },
    text: 'Ask CNN to include crypto questions at the Presidential Debate',
    subtext: 'Send an email to CNN and tell them we need the candidates’ stance on crypto',
    shortText: 'Email CNN to ask about crypto',
    shortSubtext: 'Send an email to CNN and tell them we need the candidates’ stance on crypto.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormEmailCNNDialog,
  },
}

export function getUserActionCTAInfo(actionType: ActiveClientUserActionType, campaign?: string) {
  if (!campaign || campaign === USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[actionType]) {
    return USER_ACTION_ROW_CTA_INFO[actionType]
  }

  if (USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN[campaign]) {
    return USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN[campaign]
  }

  throw new Error(`No CTA info found for campaign: ${campaign}`)
}
