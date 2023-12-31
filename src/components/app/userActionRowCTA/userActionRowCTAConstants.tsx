import { LazyUserActionFormCallCongressperson } from '@/components/app/userActionFormCallCongressperson/lazyLoad'
import { LazyUserActionFormDonate } from '@/components/app/userActionFormDonate/lazyLoad'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { LazyUserActionFormNFTMint } from '@/components/app/userActionFormNFTMint/lazyLoad'
import { LazyUserActionFormOptInSWC } from '@/components/app/userActionFormOptInSWC/lazyLoad'
import { LazyUserActionFormTweet } from '@/components/app/userActionFormTweet/lazyLoad'
import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { UserActionType } from '@prisma/client'

export const USER_ACTION_ROW_CTA_INFO: ReadonlyArray<Omit<UserActionRowCTAProps, 'state'>> = [
  {
    actionType: UserActionType.OPT_IN,
    image: '/actionTypeIcons/optIn.svg',
    text: 'Join Stand With Crypto',
    subtext: 'Join over 100,000 advocates fighting to keep crypto in America.',
    canBeTriggeredMultipleTimes: false,
    lazyRenderedForm: LazyUserActionFormOptInSWC,
  },
  {
    actionType: UserActionType.CALL,
    image: '/actionTypeIcons/call.svg',
    text: 'Call your Congressperson',
    subtext: 'The most effective way to make your voice heard.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: LazyUserActionFormCallCongressperson,
  },
  {
    actionType: UserActionType.EMAIL,
    image: '/actionTypeIcons/email.svg',
    text: 'Email your Congressperson',
    subtext: 'We drafted an email for you. All you have to do is hit send.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: LazyUserActionFormEmailCongressperson,
  },
  {
    actionType: UserActionType.DONATION,
    image: '/actionTypeIcons/donate.svg',
    text: 'Donate to Stand With Crypto',
    subtext: 'Support our aim to mobilize 52 million crypto advocates in the U.S.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: LazyUserActionFormDonate,
  },
  {
    actionType: UserActionType.TWEET,
    image: '/actionTypeIcons/tweet.svg',
    text: 'Share on Twitter/X',
    subtext: 'Bring more people to the movement.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: LazyUserActionFormTweet,
  },
  {
    actionType: UserActionType.NFT_MINT,
    image: '/actionTypeIcons/mintNFT.svg',
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: LazyUserActionFormNFTMint,
  },
]
