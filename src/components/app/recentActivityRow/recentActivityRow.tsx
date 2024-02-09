'use client'
import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { ThirdwebLoginDialog } from '@/components/app/authentication/thirdwebLoginContent'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedRelativeDatetimeWithClientHydration } from '@/components/ui/formattedRelativeDatetimeWithClientHydration'
import { InternalLink } from '@/components/ui/link'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedLocale } from '@/intl/locales'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getIntlUrls } from '@/utils/shared/urls'
import { formatDonationOrganization } from '@/utils/web/donationUtils'
import { getUserDisplayName } from '@/utils/web/userUtils'
import { UserActionOptInType, UserActionType } from '@prisma/client'
import React from 'react'

export interface RecentActivityRowProps {
  action: ClientUserAction & { user: ClientUserWithENSData }
  locale: SupportedLocale
}

function RecentActivityRowBase({
  locale,
  action,
  children,
  onFocusContent,
}: RecentActivityRowProps & { children: React.ReactNode; onFocusContent?: () => React.ReactNode }) {
  const [hasFocus, setHasFocus] = React.useState(false)
  const isMobile = useIsMobile({ defaultState: true })
  return (
    <div
      // added min height to prevent height shifting on hover
      className="flex min-h-[41px] items-center justify-between gap-5"
      onMouseEnter={() => isMobile || setHasFocus(true)}
      onMouseLeave={() => isMobile || setHasFocus(false)}
    >
      <div className="flex items-center gap-4">
        <div>
          <UserAvatar size={40} user={action.user} />
        </div>
        <div>{children}</div>
      </div>
      <div className="shrink-0 text-xs text-gray-500 lg:text-base">
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
                date={new Date(action.datetimeCreated)}
                locale={locale}
                timeFormatStyle="narrow"
              />
            </span>
          </>
        )}
      </div>
    </div>
  )
}

const MainText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-semibold text-gray-900 lg:text-xl">{children}</div>
)
const SubText = ({ children }: { children: React.ReactNode }) => (
  <div className="hidden text-xs text-gray-500 md:block lg:text-base">{children}</div>
)

const formatDTSIPerson = (person: DTSIPersonForUserActions) => {
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
          children: (
            <>
              <MainText>
                {userDisplayName} {getTypeDisplayText()}
              </MainText>
            </>
          ),
          onFocusContent: hasSignedUp
            ? undefined
            : () => (
                <ThirdwebLoginDialog>
                  <Button>Join</Button>
                </ThirdwebLoginDialog>
              ),
        }
      }
      case UserActionType.CALL:
        return {
          children: (
            <>
              <MainText>{userDisplayName} called their representative</MainText>
              <SubText>{formatDTSIPerson(action.person)}</SubText>
            </>
          ),
          onFocusContent: () => (
            <UserActionFormCallCongresspersonDialog>
              <Button>Call yours</Button>
            </UserActionFormCallCongresspersonDialog>
          ),
        }
      case UserActionType.DONATION:
        return {
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
          onFocusContent: () => {
            return (
              <InternalLink className="block" href={getIntlUrls(locale).donate()}>
                <Button>Donate</Button>
              </InternalLink>
            )
          },
        }
      case UserActionType.EMAIL:
        return {
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
          onFocusContent: () => (
            <UserActionFormEmailCongresspersonDialog>
              <Button>Email yours</Button>
            </UserActionFormEmailCongresspersonDialog>
          ),
        }
      case UserActionType.NFT_MINT: {
        return {
          children: <MainText>{userDisplayName} donated by minting an NFT</MainText>,
          onFocusContent: () => (
            <UserActionFormNFTMintDialog>
              <Button>Mint yours</Button>
            </UserActionFormNFTMintDialog>
          ),
        }
      }
      case UserActionType.TWEET: {
        return {
          children: <MainText>{userDisplayName} tweeted in support of crypto</MainText>,
          onFocusContent: () => <UserActionTweetLink>Tweet</UserActionTweetLink>,
        }
      }
      case UserActionType.VOTER_REGISTRATION: {
        return {
          children: <MainText>{userDisplayName} registered to vote</MainText>,
          onFocusContent: () => (
            <UserActionFormVoterRegistrationDialog>
              <Button>Register</Button>
            </UserActionFormVoterRegistrationDialog>
          ),
        }
      }
    }
    return gracefullyError({
      fallback: 'helped crypto',
      // @ts-ignore
      msg: `Unknown action type in RecentActivityRow for action ${action.id}: ${action.actionType}`,
    })
  }
  return <RecentActivityRowBase action={action} locale={locale} {...getActionSpecificProps()} />
}
