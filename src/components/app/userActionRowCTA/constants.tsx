'use client'
import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { InternalLink } from '@/components/ui/link'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'

export const USER_ACTION_ROW_CTA_INFO: Record<
  UserActionType,
  Omit<UserActionRowCTAProps, 'state'>
> = {
  [UserActionType.OPT_IN]: {
    actionType: UserActionType.OPT_IN,
    image: '/actionTypeIcons/optIn.svg',
    text: 'Join Stand With Crypto',
    subtext: 'Join over 300,000 advocates fighting to keep crypto in America.',
    canBeTriggeredMultipleTimes: false,
    WrapperComponent: ({ children }) => <LoginDialogWrapper>{children}</LoginDialogWrapper>,
  },
  [UserActionType.VOTER_REGISTRATION]: {
    actionType: UserActionType.VOTER_REGISTRATION,
    image: '/actionTypeIcons/registerToVote.svg',
    text: 'Check your voter registration and get a free NFT',
    subtext:
      'You can make a difference this year. Register to vote and get a free "I\'m a Voter" NFT',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormVoterRegistrationDialog,
  },
  [UserActionType.CALL]: {
    actionType: UserActionType.CALL,
    image: '/actionTypeIcons/call.svg',
    text: 'Call your Congressperson',
    subtext: 'The most effective way to make your voice heard.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormCallCongresspersonDialog,
  },
  [UserActionType.EMAIL]: {
    actionType: UserActionType.EMAIL,
    image: '/actionTypeIcons/email.svg',
    text: 'Email your Congressperson',
    subtext: 'We drafted an email for you. All you have to do is hit send.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormEmailCongresspersonDialog,
  },
  [UserActionType.DONATION]: {
    actionType: UserActionType.DONATION,
    image: '/actionTypeIcons/donate.svg',
    text: 'Donate to Stand With Crypto',
    subtext: 'Support our aim to mobilize 52 million crypto advocates in the U.S.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: ({ children }) => {
      const locale = useLocale()
      return (
        <InternalLink className="block" href={getIntlUrls(locale).donate()}>
          {children}
        </InternalLink>
      )
    },
  },
  [UserActionType.TWEET]: {
    actionType: UserActionType.TWEET,
    image: '/actionTypeIcons/tweet.svg',
    text: 'Share on Twitter/X',
    subtext: 'Bring more people to the movement.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: ({ children }) => (
      <UserActionTweetLink asChild>{children}</UserActionTweetLink>
    ),
  },
  [UserActionType.NFT_MINT]: {
    actionType: UserActionType.NFT_MINT,
    image: '/actionTypeIcons/mintNFT.svg',
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormNFTMintDialog,
  },
}
