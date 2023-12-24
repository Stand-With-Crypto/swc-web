import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { UserActionType } from '@prisma/client'
import { lazy } from 'react'

export const USER_ACTION_ROW_CTA_INFO: ReadonlyArray<Omit<UserActionRowCTAProps, 'state'>> = [
  {
    actionType: UserActionType.OPT_IN,
    image: '/actionTypeIcons/optIn.svg',
    text: 'Join Stand With Crypto',
    subtext: 'Join over 100,000 advocates fighting to keep crypto in America.',
    canBeTriggeredMultipleTimes: false,
    lazyRenderedForm: lazy(() => Promise.resolve({ default: () => <div>TODO</div> })),
  },
  {
    actionType: UserActionType.CALL,
    image: '/actionTypeIcons/call.svg',
    text: 'Call your Congressperson',
    subtext: 'The most effective way to make your voice heard.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: lazy(() => Promise.resolve({ default: () => <div>TODO</div> })),
  },
  {
    actionType: UserActionType.EMAIL,
    image: '/actionTypeIcons/email.svg',
    text: 'Email your Congressperson',
    subtext: 'We drafted an email for you. All you have to do is hit send.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: lazy(() => Promise.resolve({ default: () => <div>TODO</div> })),
  },
  {
    actionType: UserActionType.DONATION,
    image: '/actionTypeIcons/donate.svg',
    text: 'Donate to Stand With Crypto',
    subtext: 'Support our aim to mobilize 52 million crypto advocates in the U.S.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: lazy(() => Promise.resolve({ default: () => <div>TODO</div> })),
  },
  {
    actionType: UserActionType.TWEET,
    image: '/actionTypeIcons/tweet.svg',
    text: 'Share on Twitter/X',
    subtext: 'Bring more people to the movement.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: lazy(() => Promise.resolve({ default: () => <div>TODO</div> })),
  },
  {
    actionType: UserActionType.NFT_MINT,
    image: '/actionTypeIcons/mintNFT.svg',
    text: 'Mint your Supporter NFT',
    subtext: 'All mint proceeds are donated to the movement.',
    canBeTriggeredMultipleTimes: true,
    lazyRenderedForm: lazy(() => Promise.resolve({ default: () => <div>TODO</div> })),
  },
]
