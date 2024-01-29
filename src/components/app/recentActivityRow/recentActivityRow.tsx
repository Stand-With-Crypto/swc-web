'use client'
import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormDonateDialog } from '@/components/app/userActionFormDonate/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormOptInSWCDialog } from '@/components/app/userActionFormOptInSWC/dialog'
import { UserActionFormTweetDialog } from '@/components/app/userActionFormTweet/dialog'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedRelativeDatetimeWithClientHydration } from '@/components/ui/formattedRelativeDatetimeWithClientHydration'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedLocale } from '@/intl/locales'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { formatDonationOrganization } from '@/utils/web/donationUtils'
import { getUserDisplayName } from '@/utils/web/userUtils'
import { UserActionOptInType, UserActionType } from '@prisma/client'
import React from 'react'

interface RecentActivityRowProps {
  action: ClientUserAction & { user: ClientUserWithENSData }
  locale: SupportedLocale
  disableHover?: boolean
}

function RecentActivityRowBase({
  locale,
  action,
  children,
  onFocusContent,
  disableHover,
}: RecentActivityRowProps & { children: React.ReactNode; onFocusContent?: () => React.ReactNode }) {
  const [hasFocus, setHasFocus] = React.useState(false)
  const isMobile = useIsMobile({ defaultState: true })
  return (
    <div
      // added min height to prevent height shifting on hover
      className="flex min-h-[41px] items-center justify-between gap-5"
      onMouseEnter={() => disableHover || isMobile || setHasFocus(true)}
      onMouseLeave={() => disableHover || isMobile || setHasFocus(false)}
    >
      <div className="flex items-center gap-2">
        <div>
          <UserAvatar size={30} user={action.user} />
        </div>
        <div>{children}</div>
      </div>
      <div className="shrink-0 text-xs text-gray-500">
        {/* TODO add animation */}
        {hasFocus && onFocusContent ? (
          onFocusContent?.()
        ) : (
          <>
            <span className="hidden md:inline">
              <FormattedRelativeDatetimeWithClientHydration
                date={new Date(action.datetimeCreated)}
                locale={locale}
              />
            </span>
            <span className="inline md:hidden">
              <FormattedRelativeDatetimeWithClientHydration
                timeFormatStyle="narrow"
                date={new Date(action.datetimeCreated)}
                locale={locale}
              />
            </span>
          </>
        )}
      </div>
    </div>
  )
}

const MainText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-bold text-gray-900">{children}</div>
)
const SubText = ({ children }: { children: React.ReactNode }) => (
  <div className="hidden text-xs text-gray-500 md:block">{children}</div>
)

const formatDTSIPerson = (person: DTSIPersonForUserActions) => {
  // TODO add their current role
  const politicalAffiliation = person.politicalAffiliationCategory
    ? `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(person.politicalAffiliationCategory)})`
    : ''
  return `${dtsiPersonFullName(person)} ${politicalAffiliation}`
}

export function RecentActivityRow(props: RecentActivityRowProps) {
  const { action, locale } = props
  const userDisplayName = getUserDisplayName(props.action.user)
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const hasSignedUp = data?.performedUserActionTypes.includes(UserActionType.OPT_IN)
  const getActionSpecificProps = () => {
    switch (action.actionType) {
      case UserActionType.OPT_IN: {
        const getTypeDisplayText = () => {
          switch (action.optInType) {
            case UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER:
              return (
                <>
                  joined <span className="hidden sm:inline">Stand With Crypto</span>
                  <span className="sm:hidden">SWC</span>
                </>
              )
          }
        }
        return {
          onFocusContent: hasSignedUp
            ? undefined
            : () => (
                <UserActionFormOptInSWCDialog>
                  <Button>Join</Button>
                </UserActionFormOptInSWCDialog>
              ),
          children: (
            <>
              <MainText>
                {userDisplayName} {getTypeDisplayText()}
              </MainText>
            </>
          ),
        }
      }
      case UserActionType.CALL:
        return {
          onFocusContent: () => (
            <UserActionFormCallCongresspersonDialog>
              <Button>Call yours</Button>
            </UserActionFormCallCongresspersonDialog>
          ),
          children: (
            <>
              <MainText>{userDisplayName} called their representative</MainText>
              <SubText>{formatDTSIPerson(action.person)}</SubText>
            </>
          ),
        }
      case UserActionType.DONATION:
        return {
          onFocusContent: () => (
            <UserActionFormDonateDialog>
              <Button>Donate</Button>
            </UserActionFormDonateDialog>
          ),
          children: (
            <>
              <MainText>{userDisplayName} donated</MainText>
              <SubText>
                <FormattedCurrency
                  amount={action.amount}
                  currencyCode={action.amountCurrencyCode}
                  locale={locale}
                />{' '}
                to {formatDonationOrganization(action.recipient)}
              </SubText>
            </>
          ),
        }
      case UserActionType.EMAIL:
        return {
          onFocusContent: () => (
            <UserActionFormEmailCongresspersonDialog>
              <Button>Email yours</Button>
            </UserActionFormEmailCongresspersonDialog>
          ),
          children: (
            <>
              <MainText>
                {userDisplayName} emailed their representative
                {action.userActionEmailRecipients.length > 1 ? 's' : ''}
              </MainText>
              <SubText>
                {action.userActionEmailRecipients.map(x => formatDTSIPerson(x.person)).join(', ')}
              </SubText>
            </>
          ),
        }
      case UserActionType.NFT_MINT: {
        return {
          onFocusContent: () => (
            <UserActionFormNFTMintDialog>
              <Button>Mint yours</Button>
            </UserActionFormNFTMintDialog>
          ),
          children: <MainText>{userDisplayName} donated by minting an NFT</MainText>,
        }
      }
      case UserActionType.TWEET: {
        return {
          onFocusContent: () => (
            <UserActionFormTweetDialog>
              <Button>Tweet</Button>
            </UserActionFormTweetDialog>
          ),
          children: <MainText>{userDisplayName} tweeted in support of crypto</MainText>,
        }
      }
    }
    return gracefullyError({
      // @ts-ignore
      msg: `Unknown action type in RecentActivityRow for action ${action.id}: ${action.actionType}`,
      fallback: 'helped crypto',
    })
  }
  return (
    <RecentActivityRowBase
      disableHover={props.disableHover}
      action={action}
      locale={locale}
      {...getActionSpecificProps()}
    />
  )
}
