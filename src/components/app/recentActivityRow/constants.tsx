import React from 'react'
import { UserActionType } from '@prisma/client'

import {
  isCallAction,
  isDonationAction,
  isEmailAction,
  isLiveEventAction,
  isNFTMintAction,
  isOptInAction,
  isReferAction,
  isRsvpEventAction,
  isTweetAction,
  isTweetAtPersonAction,
  isViewKeyRacesAction,
  isVoterAttestationAction,
  isVoterRegistrationAction,
  isVotingDayAction,
  isVotingInformationResearchedAction,
} from '@/clientModels/clientUserAction/typeGuards'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'
import { UserActionFormCallCongresspersonDialog } from '@/components/app/userActionFormCallCongressperson/dialog'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { UserActionFormNFTMintDialog } from '@/components/app/userActionFormNFTMint/dialog'
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
import { COUNTRY_CODE_TO_LOCALE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  UserActionEmailCampaignName,
  UserActionLiveEventCampaignName,
  UserActionTweetCampaignName,
} from '@/utils/shared/userActionCampaigns'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP } from '@/utils/shared/usStateUtils'
import { listOfThings } from '@/utils/web/listOfThings'

export const USER_ACTION_LIVE_EVENT_LOCATION: Record<UserActionLiveEventCampaignName, string> = {
  [UserActionLiveEventCampaignName['2024_03_04_LA']]: 'CA',
}

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

const getLocationText = (
  userLocationDetails: { administrativeAreaLevel1?: string | null } | null | undefined,
  prefix: 'in' | 'from',
) =>
  userLocationDetails?.administrativeAreaLevel1
    ? `${prefix} ${userLocationDetails.administrativeAreaLevel1}`
    : ''

type ExtendedRecentActivityRowProps = RecentActivityRowProps & {
  urls: ReturnType<typeof useIntlUrls>
}

type ActionSpecificProps = {
  onFocusContent?: () => React.ReactNode
  children: React.ReactNode
}

const OptInActionFocusContent = () => {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const hasSignedUp = data?.performedUserActionTypes.some(
    performedAction => performedAction.actionType === UserActionType.OPT_IN,
  )

  return hasSignedUp ? null : (
    <LoginDialogWrapper>
      <Button>Join</Button>
    </LoginDialogWrapper>
  )
}

export const USER_ACTION_PROPS_FOR_RECENT_ACTIVITY_ROW: {
  [key in UserActionType]: (props: ExtendedRecentActivityRowProps) => ActionSpecificProps
} = {
  [UserActionType.OPT_IN]: ({ action }) => {
    if (!isOptInAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to OPT_IN variant`)
    }
    const { userLocationDetails } = action.user
    return {
      onFocusContent: OptInActionFocusContent,
      children: (
        <MainText>
          New member {getLocationText(userLocationDetails, 'from')} joined {getSWCDisplayText()}
        </MainText>
      ),
    }
  },

  [UserActionType.CALL]: ({ action, urls }) => {
    if (!isCallAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to CALL variant`)
    }
    const onFocusContent = () => (
      <UserActionFormCallCongresspersonDialog>
        <Button>Call yours</Button>
      </UserActionFormCallCongresspersonDialog>
    )
    return {
      onFocusContent,
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
  },

  [UserActionType.DONATION]: ({ action, countryCode }) => {
    if (!isDonationAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to DONATION variant`)
    }
    const { userLocationDetails } = action.user
    const onFocusContent = () => (
      <InternalLink className="block" href={getIntlUrls(countryCode).donate()}>
        <Button>Donate</Button>
      </InternalLink>
    )
    return {
      onFocusContent,
      children: (
        <MainText>
          Someone {getLocationText(userLocationDetails, 'in')} donated{' '}
          <FormattedCurrency
            amount={action.amountUsd}
            currencyCode={SupportedFiatCurrencyCodes.USD}
            locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          />{' '}
          to {getSWCDisplayText()}
        </MainText>
      ),
    }
  },

  [UserActionType.EMAIL]: ({ action, urls }) => {
    if (!isEmailAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to EMAIL variant`)
    }
    const dtsiRecipients = action.userActionEmailRecipients.filter(x => x.person)

    switch (action.campaignName) {
      case UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024:
        return {
          children: <MainText>Email sent to CNN</MainText>,
        }

      case UserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024:
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
  },

  [UserActionType.NFT_MINT]: ({ action, countryCode }) => {
    if (!isNFTMintAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to NFT_MINT variant`)
    }
    const onFocusContent = () => (
      <UserActionFormNFTMintDialog>
        <Button>Mint yours</Button>
      </UserActionFormNFTMintDialog>
    )
    return {
      onFocusContent,
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
  },

  [UserActionType.TWEET]: ({ action }) => {
    if (!isTweetAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to TWEET variant`)
    }
    const { userLocationDetails } = action.user
    const onFocusContent = () => (
      <UserActionTweetLink>
        <Button>Follow</Button>
      </UserActionTweetLink>
    )
    return {
      onFocusContent,
      children:
        action.campaignName === UserActionTweetCampaignName.FOLLOW_SWC_ON_X_2024 ? (
          <MainText>
            New {getSWCDisplayText()} follower on X {getLocationText(userLocationDetails, 'from')}
          </MainText>
        ) : (
          <MainText>Tweet sent in support of {getSWCDisplayText()}</MainText>
        ),
    }
  },

  [UserActionType.VOTER_REGISTRATION]: ({ action }) => {
    if (!isVoterRegistrationAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to VOTER_REGISTRATION variant`)
    }
    const { userLocationDetails } = action.user
    return {
      onFocusContent: undefined,
      children: (
        <MainText>
          Someone checked their voter registration {getLocationText(userLocationDetails, 'in')}
        </MainText>
      ),
    }
  },

  [UserActionType.LIVE_EVENT]: ({ action }) => {
    if (!isLiveEventAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to LIVE_EVENT variant`)
    }
    return {
      onFocusContent: undefined,
      children: (
        <MainText>{`Attended an in-person crypto event ${USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName] ? `in ${USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName]}` : ''}`}</MainText>
      ),
    }
  },

  [UserActionType.TWEET_AT_PERSON]: ({ action, urls }) => {
    if (!isTweetAtPersonAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to TWEET_AT_PERSON variant`)
    }
    const onFocusContent = () => (
      <LoginDialogWrapper>
        <Button>Join</Button>
      </LoginDialogWrapper>
    )
    return {
      onFocusContent,
      children: (
        <MainText>
          Bitcoin Pizza Day 🍕 tweet sent{' '}
          {action.person && (
            <>
              {'to '}
              <DTSIPersonName
                href={urls.politicianDetails(action.person.slug)}
                person={action.person}
              />
            </>
          )}
        </MainText>
      ),
    }
  },

  [UserActionType.VOTER_ATTESTATION]: ({ action }) => {
    if (!isVoterAttestationAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to VOTER_ATTESTATION variant`)
    }
    return {
      onFocusContent: undefined,
      children: <MainText>Someone pledged to vote</MainText>,
    }
  },

  [UserActionType.RSVP_EVENT]: ({ action }) => {
    if (!isRsvpEventAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to RSVP_EVENT variant`)
    }
    return {
      onFocusContent: undefined,
      children: (
        <MainText>
          New sign up for an SWC event in{' '}
          {
            US_STATE_CODE_TO_DISPLAY_NAME_MAP[
              action.eventState as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
            ]
          }
        </MainText>
      ),
    }
  },

  [UserActionType.VIEW_KEY_RACES]: ({ action }) => {
    if (!isViewKeyRacesAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to VIEW_KEY_RACES variant`)
    }
    return {
      onFocusContent: undefined,
      children: <MainText>Someone investigated the key races in their district</MainText>,
    }
  },

  [UserActionType.VOTING_INFORMATION_RESEARCHED]: ({ action }) => {
    if (!isVotingInformationResearchedAction(action)) {
      throw new Error(
        `Wrong action type ${action.actionType} passed to VOTING_INFORMATION_RESEARCHED variant`,
      )
    }
    const { userLocationDetails } = action.user
    return {
      onFocusContent: undefined,
      children: (
        <MainText>Voter plan researched {getLocationText(userLocationDetails, 'in')}</MainText>
      ),
    }
  },

  [UserActionType.VOTING_DAY]: ({ action }) => {
    if (!isVotingDayAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to VOTING_DAY variant`)
    }
    const { userLocationDetails } = action.user
    return {
      onFocusContent: undefined,
      children: (
        <MainText>
          Someone {getLocationText(userLocationDetails, 'in')} claimed "I Voted" NFT
        </MainText>
      ),
    }
  },

  [UserActionType.REFER]: ({ action }) => {
    if (!isReferAction(action)) {
      throw new Error(`Wrong action type ${action.actionType} passed to REFER variant`)
    }
    return {
      onFocusContent: undefined,
      children: <MainText>Someone referred a friend to SWC</MainText>,
    }
  },
}
