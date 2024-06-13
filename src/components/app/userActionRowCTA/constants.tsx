'use client'

import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CALL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCNNDialog } from '@/components/app/userActionFormEmailCNN/dialog'
import { EMAIL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormEmailCongressperson/constants'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { InternalLink } from '@/components/ui/link'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
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
    image: '/actionTypeIcons/optIn.png',
    text: 'Join Stand With Crypto',
    subtext: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
    canBeTriggeredMultipleTimes: false,
    WrapperComponent: ({ children }) => (
      <LoginDialogWrapper forceUnauthenticated>{children}</LoginDialogWrapper>
    ),
  },
  [UserActionType.VOTER_REGISTRATION]: {
    actionType: UserActionType.VOTER_REGISTRATION,
    image: '/actionTypeIcons/registerToVote.png',
    text: 'Check your voter registration and get a free NFT',
    subtext:
      'You can make a difference this year. Register to vote and get a free "I\'m a Voter" NFT',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormVoterRegistrationDialog,
  },
  [UserActionType.CALL]: {
    actionType: UserActionType.CALL,
    image: '/actionTypeIcons/call.png',
    text: `Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`,
    subtext: 'The most effective way to make your voice heard.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormCallCongresspersonDialog,
  },
  [UserActionType.EMAIL]: {
    actionType: UserActionType.EMAIL,
    image: '/actionTypeIcons/email.png',
    text: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
    subtext: 'We drafted an email for you. All you have to do is hit send.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormEmailCongresspersonDialog,
  },
  [UserActionType.DONATION]: {
    actionType: UserActionType.DONATION,
    image: '/actionTypeIcons/donate.png',
    text: 'Donate to Stand With Crypto',
    subtext: 'Support our aim to mobilize 52 million crypto advocates in the U.S.',
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
    image: '/actionTypeIcons/tweet.png',
    text: 'Share on Twitter/X',
    subtext: 'Bring more people to the movement.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: ({ children }) => (
      <UserActionTweetLink asChild>{children}</UserActionTweetLink>
    ),
  },
  [UserActionType.NFT_MINT]: {
    actionType: UserActionType.NFT_MINT,
    image: '/actionTypeIcons/mintNFT.png',
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
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
    image: '/actionTypeIcons/email-cnn.png',
    text: 'Ask CNN to feature crypto at the Presidential Debate',
    subtext: 'Email CNN and ask them to include crypto in the presidential debate.',
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

  return null
}
