'use client'
import React from 'react'
import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { USER_ACTION_LIVE_EVENT_LOCATION } from '@/components/app/recentActivityRow/constants'
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
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { getDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getIntlUrls } from '@/utils/shared/urls'
import { listOfThings } from '@/utils/web/listOfThings'

const MainText = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-semibold text-gray-900 lg:text-xl">{children}</div>
)

const DTSIPersonName = ({ person, href }: { person: DTSIPersonForUserActions; href: string }) => {
  const link = <InternalLink href={href}>{dtsiPersonFullName(person)}</InternalLink>
  if (person.primaryRole) {
    return (
      <>
        {getDTSIPersonRoleCategoryDisplayName(person.primaryRole)} {link}
      </>
    )
  }
  return link
}

const getSWCDisplayText = () => (
  <>
    <span className="hidden sm:inline"> Stand With Crypto</span>
    <span className="sm:hidden"> SWC </span>
  </>
)
export const VariantRecentActivityRow = function VariantRecentActivityRow({
  action,
  locale,
}: RecentActivityRowProps) {
  const urls = useIntlUrls()

  const { userLocationDetails } = action.user
  const isStateAvailable = userLocationDetails?.administrativeAreaLevel1
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const hasSignedUp = data?.performedUserActionTypes.includes(UserActionType.OPT_IN)
  const newUserStateOrJoin = isStateAvailable
    ? `from ${userLocationDetails.administrativeAreaLevel1} joined`
    : 'joined'
  const voterStateOrEmpty = isStateAvailable
    ? `in ${userLocationDetails.administrativeAreaLevel1}`
    : ''

  const getActionSpecificProps = () => {
    switch (action.actionType) {
      case UserActionType.OPT_IN: {
        return {
          onFocusContent: hasSignedUp
            ? undefined
            : () => (
                <LoginDialogWrapper>
                  <Button>Join</Button>
                </LoginDialogWrapper>
              ),
          children: (
            <MainText>
              New member {newUserStateOrJoin}
              {getSWCDisplayText()}
            </MainText>
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
            <MainText>
              Call to{' '}
              {action.person ? (
                <DTSIPersonName
                  href={urls.politicianDetails(action.person.slug)}
                  person={action.person}
                />
              ) : (
                'Representative'
              )}
            </MainText>
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
            <MainText>
              <FormattedCurrency
                amount={action.amountUsd}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                locale={locale}
              />{' '}
              donation
            </MainText>
          ),
        }
      case UserActionType.EMAIL: {
        const dtsiRecipients = action.userActionEmailRecipients.filter(x => x.person)
        return {
          onFocusContent: () => (
            <UserActionFormEmailCongresspersonDialog>
              <Button>Email yours</Button>
            </UserActionFormEmailCongresspersonDialog>
          ),
          children: (
            <MainText>
              Email to{' '}
              {dtsiRecipients.length
                ? listOfThings(
                    dtsiRecipients.map(actionEmailRecipient => (
                      <React.Fragment key={actionEmailRecipient.id}>
                        <DTSIPersonName
                          href={urls.politicianDetails(actionEmailRecipient.person!.slug)}
                          person={actionEmailRecipient.person!}
                        />
                      </React.Fragment>
                    )),
                  ).map((content, index) => <React.Fragment key={index}>{content}</React.Fragment>)
                : 'Representative'}
            </MainText>
          ),
        }
      }
      case UserActionType.NFT_MINT: {
        return {
          onFocusContent: () => (
            <UserActionFormNFTMintDialog>
              <Button>Mint yours</Button>
            </UserActionFormNFTMintDialog>
          ),
          children: (
            <MainText>
              <FormattedCurrency
                amount={action.nftMint.costAtMintUsd}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                locale={locale}
              />{' '}
              donation
            </MainText>
          ),
        }
      }
      case UserActionType.TWEET: {
        return {
          onFocusContent: () => <UserActionTweetLink>Tweet</UserActionTweetLink>,
          children: <MainText>Tweet sent in support of {getSWCDisplayText()}</MainText>,
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
      case UserActionType.LIVE_EVENT: {
        return {
          onFocusContent: undefined,
          children: (
            <MainText>{`Attended an in-person crypto event ${USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName] ? `in ${USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName]}` : ''}`}</MainText>
          ),
        }
      }
      case UserActionType.TWEET_AT_PERSON: {
        return {
          onFocusContent: () => (
            <LoginDialogWrapper>
              <Button>Join</Button>
            </LoginDialogWrapper>
          ),
          children: (
            <MainText>
              Bitcoin Pizza Day 🍕 tweet sent{' '}
              {action.person ? (
                <>
                  {'to '}
                  <DTSIPersonName
                    href={urls.politicianDetails(action.person.slug)}
                    person={action.person}
                  />
                </>
              ) : (
                'on X'
              )}
            </MainText>
          ),
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
