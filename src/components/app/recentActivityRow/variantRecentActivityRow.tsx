'use client'
import React from 'react'
import { UserActionOptInType, UserActionType } from '@prisma/client'

import { ThirdwebLoginDialog } from '@/components/app/authentication/thirdwebLoginContent'
import {
  RecentActivityRowBase,
  RecentActivityRowProps,
} from '@/components/app/recentActivityRow/recentActivityRow'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { InternalLink } from '@/components/ui/link'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getIntlUrls } from '@/utils/shared/urls'
import { formatDonationOrganization } from '@/utils/web/donationUtils'
import { getUserDisplayName } from '@/utils/web/userUtils'

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

export const VariantRecentActivityRow = function VariantRecentActivityRow({
  action,
  locale,
}: RecentActivityRowProps) {
  const { userLocationDetails } = action.user
  const userDisplayName = getUserDisplayName(action.user)
  const isStateAvailable = userLocationDetails?.administrativeAreaLevel1
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const hasSignedUp = data?.performedUserActionTypes.includes(UserActionType.OPT_IN)
  const newUserStateOrJoin = isStateAvailable
    ? `from ${userLocationDetails.administrativeAreaLevel1} joined!`
    : 'joined!'
  const voterStateOrEmpty = isStateAvailable
    ? `in ${userLocationDetails.administrativeAreaLevel1}`
    : ''

  const getActionSpecificProps = () => {
    switch (action.actionType) {
      case UserActionType.OPT_IN: {
        const getTypeDisplayText = () => {
          switch (action.optInType) {
            case UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER:
              return (
                <>
                  <span className="hidden sm:inline"> Stand With Crypto</span>
                  <span className="sm:hidden"> SWC </span>
                </>
              )
          }
        }
        return {
          onFocusContent: hasSignedUp
            ? undefined
            : () => (
                <ThirdwebLoginDialog>
                  <Button>Join</Button>
                </ThirdwebLoginDialog>
              ),
          children: (
            <>
              <MainText>
                New member {newUserStateOrJoin}
                {getTypeDisplayText()}
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
              <MainText>Call to representative {formatDTSIPerson(action.person)}</MainText>
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
              <MainText>
                <FormattedCurrency
                  amount={action.amount}
                  currencyCode={action.amountCurrencyCode}
                  locale={locale}
                />{' '}
                donation
              </MainText>
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
                Email to{' '}
                {action.userActionEmailRecipients.map(x => formatDTSIPerson(x.person)).join(', ')}
              </MainText>
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
          children: <MainText>Voter registration confirmed {voterStateOrEmpty}</MainText>,
        }
      }
    }
    return gracefullyError({
      // @ts-ignore
      msg: `Unknown action type in VariantRecentActivityRow for action ${action.id}: ${action.actionType}`,
      fallback: 'helped crypto',
    })
  }
  return <RecentActivityRowBase action={action} locale={locale} {...getActionSpecificProps()} />
}
