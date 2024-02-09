'use client'

import { UserActionType } from '@prisma/client'
import { useMemo } from 'react'

import { ThirdwebLoginDialog } from '@/components/app/authentication/thirdwebLoginContent'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionRowCTA, UserActionRowCTAProps } from '@/components/app/userActionRowCTA'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { cn } from '@/utils/web/cn'
import { InternalLink } from '@/components/ui/link'
import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'

export const ORDERED_USER_ACTION_ROW_CTA_INFO: ReadonlyArray<Omit<UserActionRowCTAProps, 'state'>> =
  [
    {
      WrapperComponent: ({ children }) => <ThirdwebLoginDialog>{children}</ThirdwebLoginDialog>,
      actionType: UserActionType.OPT_IN,
      canBeTriggeredMultipleTimes: false,
      image: '/actionTypeIcons/optIn.svg',
      subtext: 'Join over 100,000 advocates fighting to keep crypto in America.',
      text: 'Join Stand With Crypto',
    },
    {
      WrapperComponent: UserActionFormCallCongresspersonDialog,
      actionType: UserActionType.CALL,
      canBeTriggeredMultipleTimes: true,
      image: '/actionTypeIcons/call.svg',
      subtext: 'The most effective way to make your voice heard.',
      text: 'Call your Congressperson',
    },
    {
      WrapperComponent: UserActionFormEmailCongresspersonDialog,
      actionType: UserActionType.EMAIL,
      canBeTriggeredMultipleTimes: true,
      image: '/actionTypeIcons/email.svg',
      subtext: 'We drafted an email for you. All you have to do is hit send.',
      text: 'Email your Congressperson',
    },
    {
      WrapperComponent: ({ children }) => {
        const locale = useLocale()
        return (
          <InternalLink className="block" href={getIntlUrls(locale).donate()}>
            {children}
          </InternalLink>
        )
      },
      actionType: UserActionType.DONATION,
      canBeTriggeredMultipleTimes: true,
      image: '/actionTypeIcons/donate.svg',
      subtext: 'Support our aim to mobilize 52 million crypto advocates in the U.S.',
      text: 'Donate to Stand With Crypto',
    },
    {
      WrapperComponent: ({ children }) => (
        <UserActionTweetLink asChild>{children}</UserActionTweetLink>
      ),
      actionType: UserActionType.TWEET,
      canBeTriggeredMultipleTimes: true,
      image: '/actionTypeIcons/tweet.svg',
      subtext: 'Bring more people to the movement.',
      text: 'Share on Twitter/X',
    },
    {
      WrapperComponent: UserActionFormNFTMintDialog,
      actionType: UserActionType.NFT_MINT,
      canBeTriggeredMultipleTimes: true,
      image: '/actionTypeIcons/mintNFT.svg',
      subtext: 'All mint proceeds are donated to the movement.',
      text: 'Mint your Supporter NFT',
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
