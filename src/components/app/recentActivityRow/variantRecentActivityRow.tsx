'use client'
import React from 'react'
import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/[countryCode]/performed-user-action-types/route'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { USER_ACTION_LIVE_EVENT_LOCATION } from '@/components/app/recentActivityRow/constants'
import { RecentActivityRowMainText as MainText } from '@/components/app/recentActivityRow/mainText'
import {
  RecentActivityRowBase,
  RecentActivityRowProps,
} from '@/components/app/recentActivityRow/recentActivityRow'
import { viewKeyPageRecentActivityRow } from '@/components/app/recentActivityRow/viewKeyPageRecentActivityRow'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormFollowLinkedInDialog } from '@/components/app/userActionFormFollowOnLinkedIn/common/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { InternalLink } from '@/components/ui/link'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { DTSIPersonForUserActions } from '@/data/dtsi/queries/queryDTSIPeopleBySlugForUserActions'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { getRoleNameResolver } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  getElectoralZoneDescriptorByCountryCode,
  getStateNameResolver,
} from '@/utils/shared/stateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  USUserActionEmailCampaignName,
  USUserActionTweetCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { listOfThings } from '@/utils/web/listOfThings'

const DTSIPersonName = ({
  person,
  href,
  countryCode,
}: {
  person: DTSIPersonForUserActions
  href: string
  countryCode: SupportedCountryCodes
}) => {
  const roleNameResolver = getRoleNameResolver(countryCode)
  const link = <InternalLink href={href}>{dtsiPersonFullName(person)}</InternalLink>
  if (person.primaryRole) {
    return (
      <>
        {roleNameResolver(person.primaryRole)} {link}
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

const hasTakenAction = (
  actionType: UserActionType,
  performedUserActionTypes?: GetUserPerformedUserActionTypesResponse['performedUserActionTypes'],
) => performedUserActionTypes?.some(performedAction => performedAction.actionType === actionType)

export const VariantRecentActivityRow = function VariantRecentActivityRow({
  action,
  countryCode,
}: RecentActivityRowProps) {
  const urls = useIntlUrls()

  const stateNameResolver = getStateNameResolver(countryCode)

  const { userLocationDetails } = action.user
  const isStateAvailable = userLocationDetails?.administrativeAreaLevel1
  const { data } = useApiResponseForUserPerformedUserActionTypes()

  const hasSignedUp = hasTakenAction(UserActionType.OPT_IN, data?.performedUserActionTypes)
  const hasJoinedLinkedIn = hasTakenAction(UserActionType.LINKEDIN, data?.performedUserActionTypes)
  const hasVotedInPoll = hasTakenAction(UserActionType.POLL, data?.performedUserActionTypes)

  const fromStateOrEmpty = isStateAvailable
    ? `from ${userLocationDetails.administrativeAreaLevel1}`
    : ''
  const inStateOrEmpty = isStateAvailable
    ? `in ${userLocationDetails.administrativeAreaLevel1}`
    : ''

  const getActionSpecificProps = (): {
    onFocusContent?: React.ComponentType
    children: React.ReactNode
  } => {
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
              New member {fromStateOrEmpty} joined {getSWCDisplayText()}
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
                  countryCode={countryCode}
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
              <InternalLink className="block" href={getIntlUrls(countryCode).donate()}>
                <Button>Donate</Button>
              </InternalLink>
            )
          },
          children: (
            <MainText>
              Someone {inStateOrEmpty} donated{' '}
              <FormattedCurrency
                amount={action.amountUsd}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              to {getSWCDisplayText()}
            </MainText>
          ),
        }
      case UserActionType.EMAIL: {
        const dtsiRecipients = action.userActionEmailRecipients.filter(x => x.person)

        switch (action.campaignName) {
          case USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024:
            return {
              children: <MainText>Email sent to CNN</MainText>,
            }

          case USUserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024:
            return {
              children: <MainText>Email sent to ABC</MainText>,
            }

          default:
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
                              countryCode={countryCode}
                              href={urls.politicianDetails(actionEmailRecipient.person!.slug)}
                              person={actionEmailRecipient.person!}
                            />
                          </React.Fragment>
                        )),
                      ).map((content, index) => (
                        <React.Fragment key={index}>{content}</React.Fragment>
                      ))
                    : 'Representative'}
                </MainText>
              ),
            }
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
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              donation
            </MainText>
          ),
        }
      }
      case UserActionType.TWEET: {
        return {
          onFocusContent: () => <UserActionTweetLink>Follow</UserActionTweetLink>,
          children:
            action.campaignName === USUserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024 ? (
              <MainText>
                New {getSWCDisplayText()} follower on X {fromStateOrEmpty}
              </MainText>
            ) : (
              <MainText>Tweet sent in support of {getSWCDisplayText()}</MainText>
            ),
        }
      }
      case UserActionType.VOTER_REGISTRATION: {
        return {
          onFocusContent: () => null,
          children: <MainText>Someone checked their voter registration {inStateOrEmpty}</MainText>,
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
              {action.person && (
                <>
                  {'to '}
                  <DTSIPersonName
                    countryCode={countryCode}
                    href={urls.politicianDetails(action.person.slug)}
                    person={action.person}
                  />
                </>
              )}
            </MainText>
          ),
        }
      }
      case UserActionType.VOTER_ATTESTATION: {
        return {
          onFocusContent: () => null,
          children: <MainText>Someone pledged to vote</MainText>,
        }
      }
      case UserActionType.RSVP_EVENT: {
        return {
          onFocusContent: undefined,
          children: (
            <MainText>
              New sign up for an SWC event{' '}
              {action.eventState ? `in ${stateNameResolver(action.eventState)}` : ''}
            </MainText>
          ),
        }
      }
      case UserActionType.VIEW_KEY_RACES: {
        return {
          onFocusContent: undefined,
          children: (
            <MainText>
              Someone investigated the key races in their{' '}
              {getElectoralZoneDescriptorByCountryCode(countryCode)}
            </MainText>
          ),
        }
      }
      case UserActionType.VOTING_INFORMATION_RESEARCHED: {
        return {
          onFocusContent: undefined,
          children: <MainText>Voter plan researched {inStateOrEmpty}</MainText>,
        }
      }
      case UserActionType.VOTING_DAY: {
        return {
          onFocusContent: () => null,
          children: <MainText>Someone {inStateOrEmpty} claimed "I Voted" NFT</MainText>,
        }
      }
      case UserActionType.REFER: {
        return {
          onFocusContent: () => null,
          children: <MainText>Someone {fromStateOrEmpty} referred a friend</MainText>,
        }
      }
      case UserActionType.POLL: {
        return {
          onFocusContent: hasVotedInPoll
            ? undefined
            : () => (
                <Button asChild>
                  <Link href={urls.polls()}>Vote</Link>
                </Button>
              ),
          children: <MainText>Someone voted in a poll</MainText>,
        }
      }
      case UserActionType.VIEW_KEY_PAGE: {
        const { campaignName } = action
        return viewKeyPageRecentActivityRow({
          campaignName,
          countryCode,
        })
      }
      case UserActionType.LINKEDIN: {
        return {
          onFocusContent: hasJoinedLinkedIn
            ? undefined
            : () => (
                <UserActionFormFollowLinkedInDialog countryCode={countryCode}>
                  <Button>Follow</Button>
                </UserActionFormFollowLinkedInDialog>
              ),
          children: <MainText>Someone followed SWC on LinkedIn</MainText>,
        }
      }
    }
    return gracefullyError({
      // @ts-ignore
      msg: `Unknown action type in VariantRecentActivityRow for action ${action.id}: ${action.actionType}`,
      fallback: 'helped crypto',
    })
  }
  return (
    <RecentActivityRowBase
      action={action}
      countryCode={countryCode}
      {...getActionSpecificProps()}
    />
  )
}
