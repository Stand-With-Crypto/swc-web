'use client'

import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { UserActionType } from '@prisma/client'

import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormDonateDialog } from '@/components/app/userActionFormDonate/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormOptInSWCDialog } from '@/components/app/userActionFormOptInSWC/dialog'
import { UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { cn } from '@/utils/web/cn'
import { useMemo } from 'react'

export const ORDERED_USER_ACTION_ROW_CTA_INFO: ReadonlyArray<Omit<UserActionRowCTAProps, 'state'>> =
  [
    {
      actionType: UserActionType.OPT_IN,
      image: '/actionTypeIcons/optIn.svg',
      text: 'Join Stand With Crypto',
      subtext: 'Join over 100,000 advocates fighting to keep crypto in America.',
      canBeTriggeredMultipleTimes: false,
      WrapperComponent: UserActionFormOptInSWCDialog,
    },
    {
      actionType: UserActionType.CALL,
      image: '/actionTypeIcons/call.svg',
      text: 'Call your Congressperson',
      subtext: 'The most effective way to make your voice heard.',
      canBeTriggeredMultipleTimes: true,
      WrapperComponent: UserActionFormCallCongresspersonDialog,
    },
    {
      actionType: UserActionType.EMAIL,
      image: '/actionTypeIcons/email.svg',
      text: 'Email your Congressperson',
      subtext: 'We drafted an email for you. All you have to do is hit send.',
      canBeTriggeredMultipleTimes: true,
      WrapperComponent: UserActionFormEmailCongresspersonDialog,
    },
    {
      actionType: UserActionType.DONATION,
      image: '/actionTypeIcons/donate.svg',
      text: 'Donate to Stand With Crypto',
      subtext: 'Support our aim to mobilize 52 million crypto advocates in the U.S.',
      canBeTriggeredMultipleTimes: true,
      WrapperComponent: UserActionFormDonateDialog,
    },
    {
      actionType: UserActionType.TWEET,
      image: '/actionTypeIcons/tweet.svg',
      text: 'Share on Twitter/X',
      subtext: 'Bring more people to the movement.',
      canBeTriggeredMultipleTimes: true,
      WrapperComponent: ({ children }) => (
        <UserActionTweetLink asChild>{children}</UserActionTweetLink>
      ),
    },
    {
      actionType: UserActionType.NFT_MINT,
      image: '/actionTypeIcons/mintNFT.svg',
      text: 'Mint your Supporter NFT',
      subtext: 'All mint proceeds are donated to the movement.',
      canBeTriggeredMultipleTimes: true,
      WrapperComponent: UserActionFormNFTMintDialog,
    },
  ]

export function UserActionRowCTAsList({
  performedUserActionTypes,
  excludeUserActionTypes,
  className,
}: {
  className?: string
  performedUserActionTypes?: UserActionType[]
  excludeUserActionTypes?: UserActionType[]
}) {
  const filteredActions = useMemo(
    () =>
      ORDERED_USER_ACTION_ROW_CTA_INFO.filter(
        action => !excludeUserActionTypes?.includes(action.actionType),
      ),
    [excludeUserActionTypes],
  )
  return (
    <div className={cn('space-y-4', className)}>
      {filteredActions.map(({ actionType, ...rest }) => (
        <UserActionRowCTA
          key={actionType}
          state={
            !performedUserActionTypes
              ? 'unknown'
              : performedUserActionTypes.includes(actionType)
                ? 'complete'
                : 'incomplete'
          }
          {...{ actionType, ...rest }}
        />
      ))}
    </div>
  )
}
