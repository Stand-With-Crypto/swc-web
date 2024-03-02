'use client'
import React from 'react'
import { UserActionOptInType, UserActionType } from '@prisma/client'
import { motion } from 'framer-motion'

import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { ClientUserAction } from '@/clientModels/clientUserAction/clientUserAction'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { ActivityAvatar } from '@/components/app/recentActivityRow/activityAvatar'
import { USER_ACTION_LIVE_EVENT_LOCATION } from '@/components/app/recentActivityRow/constants'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
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
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getIntlUrls } from '@/utils/shared/urls'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { formatDonationOrganization } from '@/utils/web/donationUtils'
import { getUserDisplayName } from '@/utils/web/userUtils'

export interface RecentActivityRowProps {
  action: ClientUserAction & { user: ClientUserWithENSData }
  locale: SupportedLocale
}

export function RecentActivityRowBase({
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
        <div className="flex-shrink-0">
          <ActivityAvatar actionType={action.actionType} size={44} />
        </div>
        <div>{children}</div>
      </div>
      <div className="shrink-0 text-xs text-gray-500 lg:text-base">
        {hasFocus && onFocusContent ? (
          <motion.div
            animate={{ opacity: 1, transform: 'translateX(0)' }}
            initial={{ opacity: 0, transform: 'translateX(10px)' }}
            transition={{ duration: 0.5 }}
          >
            {onFocusContent()}
          </motion.div>
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
          onFocusContent: hasSignedUp
            ? undefined
            : () => (
                <LoginDialogWrapper>
                  <Button>Join</Button>
                </LoginDialogWrapper>
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
              {action.person && <SubText>{formatDTSIPerson(action.person)}</SubText>}
            </>
          ),
        }
      case UserActionType.DONATION:
        return {
          onFocusContent: () => {
            return (
              <InternalLink className="block" href={getIntlUrls(locale).donate()}>
                <Button>Donate</Button>
              </InternalLink>
            )
          },
          children: (
            <>
              <MainText>{userDisplayName} donated</MainText>
              <SubText>
                <FormattedCurrency
                  amount={action.amountUsd}
                  currencyCode={SupportedFiatCurrencyCodes.USD}
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
                {action.userActionEmailRecipients
                  .filter(x => x.person)
                  .map(x => formatDTSIPerson(x.person!))
                  .join(', ')}
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
          onFocusContent: () => <UserActionTweetLink>Tweet</UserActionTweetLink>,
          children: <MainText>{userDisplayName} tweeted in support of crypto</MainText>,
        }
      }
      case UserActionType.VOTER_REGISTRATION: {
        return {
          onFocusContent: () => (
            <UserActionFormVoterRegistrationDialog>
              <Button>Register</Button>
            </UserActionFormVoterRegistrationDialog>
          ),
          children: (
            <MainText>{`${userDisplayName} confirmed to vote ${
              action.usaState ? `in ${getUSStateNameFromStateCode(action.usaState)}` : ''
            }`}</MainText>
          ),
        }
      }
      case UserActionType.LIVE_EVENT: {
        return {
          onFocusContent: undefined,
          children: (
            <MainText>{`${userDisplayName} attended an in-person crypto event in ${USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName] ? `in ${USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName]}` : ''}`}</MainText>
          ),
        }
      }
    }
    return gracefullyError({
      // @ts-ignore
      msg: `Unknown action type in RecentActivityRow for action ${action.id}: ${action.actionType}`,
      fallback: 'helped crypto',
    })
  }
  return <RecentActivityRowBase action={action} locale={locale} {...getActionSpecificProps()} />
}
