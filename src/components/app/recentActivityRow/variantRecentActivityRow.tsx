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
import { UserActionFormClaimNFTDialog } from '@/components/app/userActionFormClaimNFT/dialog'
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
import { EUCountryCode } from '@/utils/shared/euCountryMapping'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { euCountriesI18nMessages } from '@/utils/shared/i18n/eu/euCountriesTranslations'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'
import { NFTSlug } from '@/utils/shared/nft'
import {
  getElectoralZoneDescriptorByCountryCode,
  getStateNameResolver,
} from '@/utils/shared/stateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { listOfThings } from '@/utils/web/listOfThings'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      // SWC Display Text
      standWithCrypto: 'Stand With Crypto',
      swc: 'SWC',

      // Button labels
      join: 'Join',
      callYours: 'Call yours',
      donate: 'Donate',
      emailYours: 'Email yours',
      mintYours: 'Mint yours',
      follow: 'Follow',
      claimYours: 'Claim yours',
      vote: 'Vote',
      signPetitions: 'Sign petitions',
      takeAction: 'Take action',

      // Activity messages
      newMemberJoined: 'New member {fromState} joined',
      callTo: 'Call to',
      callToRepresentative: 'Call to Representative',
      someoneDonated: 'Someone {inState} donated',
      someoneDonatedTo: 'to',
      emailSentToCNN: 'Email sent to CNN',
      emailSentToABC: 'Email sent to ABC',
      emailTo: 'Email to',
      emailToRepresentative: 'Email to Representative',
      donation: 'donation',
      newFollowerOnX: 'New',
      followerOnX: 'follower on X {fromState}',
      someoneCheckedVoterRegistration: 'Someone checked their voter registration {inState}',
      attendedCryptoEvent: 'Attended an in-person crypto event{location}',
      bitcoinPizzaDayTweet: 'Bitcoin Pizza Day 🍕 tweet sent',
      someonePledgedToVote: 'Someone pledged to vote',
      newSignUpForEvent: 'New sign up for an SWC event{eventLocation}',
      someoneInvestigatedKeyRaces: 'Someone investigated the key races in their {electoralZone}',
      voterPlanResearched: 'Voter plan researched {inState}',
      someoneClaimedIVotedNFT: 'Someone {inState} claimed "I Voted" NFT',
      someoneReferredFriend: 'Someone {fromState} referred a friend',
      someoneVotedInPoll: 'Someone voted in a poll',
      someoneFollowedLinkedIn: 'Someone followed SWC on LinkedIn',
      someoneClaimedNFT: 'Someone {inState} claimed an NFT',
      someoneSignedPetition: 'Someone {inState} signed a petition',

      // Location helpers
      from: 'from {state}',
      in: 'in {state}',
      to: 'to',

      // Fallback
      helpedCrypto: 'helped crypto',
    },
    fr: {
      // SWC Display Text
      standWithCrypto: 'Stand With Crypto',
      swc: 'SWC',

      // Button labels
      join: 'Rejoindre',
      callYours: 'Appelez le vôtre',
      donate: 'Faire un don',
      emailYours: 'Envoyez un email au vôtre',
      mintYours: 'Frappez le vôtre',
      follow: 'Suivre',
      claimYours: 'Réclamez le vôtre',
      vote: 'Voter',
      signPetitions: 'Signer des pétitions',
      takeAction: 'Agir',

      // Activity messages
      newMemberJoined: 'Nouveau membre {fromState} a rejoint',
      callTo: 'Appel à',
      callToRepresentative: 'Appel au représentant',
      someoneDonated: "Quelqu'un {inState} a donné",
      someoneDonatedTo: 'à',
      emailSentToCNN: 'Email envoyé à CNN',
      emailSentToABC: 'Email envoyé à ABC',
      emailTo: 'Email à',
      emailToRepresentative: 'Email au représentant',
      donation: 'Don de',
      newFollowerOnX: 'Nouveau',
      followerOnX: 'follower sur X {fromState}',
      someoneCheckedVoterRegistration: "Quelqu'un a vérifié son inscription électorale {inState}",
      attendedCryptoEvent: 'A assisté à un événement crypto en personne{location}',
      bitcoinPizzaDayTweet: 'Tweet Bitcoin Pizza Day 🍕 envoyé',
      someonePledgedToVote: "Quelqu'un s'est engagé à voter",
      newSignUpForEvent: 'Nouvelle inscription pour un événement SWC{eventLocation}',
      someoneInvestigatedKeyRaces:
        "Quelqu'un a enquêté sur les courses clés dans leur {electoralZone}",
      voterPlanResearched: 'Plan de vote recherché {inState}',
      someoneClaimedIVotedNFT: 'Quelqu\'un {inState} a réclamé le NFT "J\'ai voté"',
      someoneReferredFriend: "Quelqu'un {fromState} a recommandé un ami",
      someoneVotedInPoll: "Quelqu'un a voté dans un sondage",
      someoneFollowedLinkedIn: "Quelqu'un a suivi SWC sur LinkedIn",
      someoneClaimedNFT: "Quelqu'un {inState} a réclamé un NFT",
      someoneSignedPetition: "Quelqu'un {inState} a signé une pétition",

      // Location helpers
      from: 'de {state}',
      in: 'en {state}',
      to: 'à',

      // Fallback
      helpedCrypto: 'a aidé la crypto',
    },
    de: {
      // SWC Display Text
      standWithCrypto: 'Stand With Crypto',
      swc: 'SWC',

      // Button labels
      join: 'Beitreten',
      callYours: 'Rufen Sie Ihren an',
      donate: 'Spenden',
      emailYours: 'E-Mail an Ihren',
      mintYours: 'Prägen Sie Ihren',
      follow: 'Folgen',
      claimYours: 'Beanspruchen Sie Ihren',
      vote: 'Abstimmen',
      signPetitions: 'Petitionen unterzeichnen',
      takeAction: 'Handeln',

      // Activity messages
      newMemberJoined: 'Neues Mitglied {fromState} ist beigetreten',
      callTo: 'Anruf an',
      callToRepresentative: 'Anruf an Vertreter',
      someoneDonated: 'Jemand {inState} hat gespendet',
      someoneDonatedTo: 'an',
      emailSentToCNN: 'E-Mail an CNN gesendet',
      emailSentToABC: 'E-Mail an ABC gesendet',
      emailTo: 'E-Mail an',
      emailToRepresentative: 'E-Mail an Vertreter',
      donation: 'Spende',
      newFollowerOnX: 'Neuer',
      followerOnX: 'Follower auf X {fromState}',
      someoneCheckedVoterRegistration: 'Jemand hat seine Wählerregistrierung überprüft {inState}',
      attendedCryptoEvent: 'Hat an einer persönlichen Krypto-Veranstaltung teilgenommen{location}',
      bitcoinPizzaDayTweet: 'Bitcoin Pizza Day 🍕 Tweet gesendet',
      someonePledgedToVote: 'Jemand hat sich verpflichtet zu wählen',
      newSignUpForEvent: 'Neue Anmeldung für eine SWC-Veranstaltung{eventLocation}',
      someoneInvestigatedKeyRaces:
        'Jemand hat die Schlüsselrennen in ihrem {electoralZone} untersucht',
      voterPlanResearched: 'Wählerplan erforscht {inState}',
      someoneClaimedIVotedNFT: 'Jemand {inState} hat "Ich habe gewählt" NFT beansprucht',
      someoneReferredFriend: 'Jemand {fromState} hat einen Freund empfohlen',
      someoneVotedInPoll: 'Jemand hat in einer Umfrage abgestimmt',
      someoneFollowedLinkedIn: 'Jemand folgt SWC auf LinkedIn',
      someoneClaimedNFT: 'Jemand {inState} hat ein NFT beansprucht',
      someoneSignedPetition: 'Jemand {inState} hat eine Petition unterzeichnet',

      // Location helpers
      from: 'aus {state}',
      in: 'in {state}',
      to: 'an',

      // Fallback
      helpedCrypto: 'hat Krypto geholfen',
    },
  },
})

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

const getSWCDisplayText = (t: (key: 'standWithCrypto' | 'swc') => string) => (
  <>
    <span className="hidden sm:inline"> {t('standWithCrypto')}</span>
    <span className="sm:hidden"> {t('swc')} </span>
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
  const { t } = useTranslation(
    mergeI18nMessages(i18nMessages, euCountriesI18nMessages),
    'VariantRecentActivityRow',
  )

  const stateNameResolver = getStateNameResolver(countryCode)

  const { userLocationDetails } = action.user
  const isStateAvailable = userLocationDetails?.administrativeAreaLevel1
  const { data } = useApiResponseForUserPerformedUserActionTypes()

  const hasSignedUp = hasTakenAction(UserActionType.OPT_IN, data?.performedUserActionTypes)
  const hasJoinedLinkedIn = hasTakenAction(UserActionType.LINKEDIN, data?.performedUserActionTypes)
  const hasVotedInPoll = hasTakenAction(UserActionType.POLL, data?.performedUserActionTypes)

  const location =
    countryCode === SupportedCountryCodes.EU
      ? t(userLocationDetails?.countryCode.toLowerCase() as EUCountryCode)
      : (userLocationDetails?.administrativeAreaLevel1 ?? '')

  const fromStateOrEmpty = isStateAvailable ? t('from', { state: location }) : ''
  const inStateOrEmpty = isStateAvailable ? t('in', { state: location }) : ''

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
                  <Button>{t('join')}</Button>
                </LoginDialogWrapper>
              ),
          children: (
            <MainText>
              {t('newMemberJoined', { fromState: fromStateOrEmpty })} {getSWCDisplayText(t)}
            </MainText>
          ),
        }
      }
      case UserActionType.CALL:
        return {
          onFocusContent: () => (
            <UserActionFormCallCongresspersonDialog>
              <Button>{t('callYours')}</Button>
            </UserActionFormCallCongresspersonDialog>
          ),
          children: (
            <MainText>
              {action.person ? (
                <>
                  {t('callTo')}{' '}
                  <DTSIPersonName
                    countryCode={countryCode}
                    href={urls.politicianDetails(action.person.slug)}
                    person={action.person}
                  />
                </>
              ) : (
                t('callToRepresentative')
              )}
            </MainText>
          ),
        }
      case UserActionType.DONATION:
        return {
          onFocusContent: () => {
            return (
              <InternalLink className="block" href={getIntlUrls(countryCode).donate()}>
                <Button>{t('donate')}</Button>
              </InternalLink>
            )
          },
          children: (
            <MainText>
              {t('someoneDonated', { inState: inStateOrEmpty })}{' '}
              <FormattedCurrency
                amount={action.amountUsd}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              {t('someoneDonatedTo')} {getSWCDisplayText(t)}
            </MainText>
          ),
        }
      case UserActionType.EMAIL: {
        const dtsiRecipients = action.userActionEmailRecipients.filter(x => x.person)

        switch (action.campaignName) {
          case USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024:
            return {
              children: <MainText>{t('emailSentToCNN')}</MainText>,
            }

          case USUserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024:
            return {
              children: <MainText>{t('emailSentToABC')}</MainText>,
            }

          default:
            return {
              onFocusContent: () => (
                <UserActionFormEmailCongresspersonDialog
                  campaignName={action.campaignName as USUserActionEmailCampaignName}
                  countryCode={action.countryCode as SupportedCountryCodes.US}
                >
                  <Button>{t('emailYours')}</Button>
                </UserActionFormEmailCongresspersonDialog>
              ),
              children: (
                <MainText>
                  {dtsiRecipients.length ? (
                    <>
                      {t('emailTo')}{' '}
                      {listOfThings(
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
                      ))}
                    </>
                  ) : (
                    t('emailToRepresentative')
                  )}
                </MainText>
              ),
            }
        }
      }
      case UserActionType.NFT_MINT: {
        return {
          onFocusContent: () => (
            <UserActionFormNFTMintDialog>
              <Button>{t('mintYours')}</Button>
            </UserActionFormNFTMintDialog>
          ),
          children: (
            <MainText>
              <FormattedCurrency
                amount={action.nftMint.costAtMintUsd}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              {t('donation')}
            </MainText>
          ),
        }
      }
      case UserActionType.TWEET: {
        return {
          onFocusContent: () => <UserActionTweetLink>{t('follow')}</UserActionTweetLink>,
          children: (
            <MainText>
              {t('newFollowerOnX')} {getSWCDisplayText(t)}{' '}
              {t('followerOnX', { fromState: fromStateOrEmpty })}
            </MainText>
          ),
        }
      }
      case UserActionType.VOTER_REGISTRATION: {
        return {
          onFocusContent: () => null,
          children: (
            <MainText>{t('someoneCheckedVoterRegistration', { inState: inStateOrEmpty })}</MainText>
          ),
        }
      }
      case UserActionType.LIVE_EVENT: {
        const eventLocation = USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName]
          ? ` ${t('in', { state: USER_ACTION_LIVE_EVENT_LOCATION[action.campaignName] })}`
          : ''
        return {
          onFocusContent: undefined,
          children: <MainText>{t('attendedCryptoEvent', { location: eventLocation })}</MainText>,
        }
      }
      case UserActionType.TWEET_AT_PERSON: {
        return {
          onFocusContent: () => (
            <LoginDialogWrapper>
              <Button>{t('join')}</Button>
            </LoginDialogWrapper>
          ),
          children: (
            <MainText>
              {t('bitcoinPizzaDayTweet')}
              {action.person && (
                <>
                  {' '}
                  {t('to')}{' '}
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
          children: <MainText>{t('someonePledgedToVote')}</MainText>,
        }
      }
      case UserActionType.RSVP_EVENT: {
        const eventLocation = action.eventState
          ? ` ${t('in', { state: stateNameResolver(action.eventState) })}`
          : ''
        return {
          onFocusContent: undefined,
          children: <MainText>{t('newSignUpForEvent', { eventLocation })}</MainText>,
        }
      }
      case UserActionType.VIEW_KEY_RACES: {
        return {
          onFocusContent: undefined,
          children: (
            <MainText>
              {t('someoneInvestigatedKeyRaces', {
                electoralZone: getElectoralZoneDescriptorByCountryCode(countryCode),
              })}
            </MainText>
          ),
        }
      }
      case UserActionType.VOTING_INFORMATION_RESEARCHED: {
        return {
          onFocusContent: undefined,
          children: <MainText>{t('voterPlanResearched', { inState: inStateOrEmpty })}</MainText>,
        }
      }
      case UserActionType.VOTING_DAY: {
        return {
          onFocusContent: () => null,
          children: (
            <MainText>{t('someoneClaimedIVotedNFT', { inState: inStateOrEmpty })}</MainText>
          ),
        }
      }
      case UserActionType.REFER: {
        return {
          onFocusContent: () => null,
          children: (
            <MainText>{t('someoneReferredFriend', { fromState: fromStateOrEmpty })}</MainText>
          ),
        }
      }
      case UserActionType.POLL: {
        return {
          onFocusContent: hasVotedInPoll
            ? undefined
            : () => (
                <Button asChild>
                  <Link href={urls.polls()}>{t('vote')}</Link>
                </Button>
              ),
          children: <MainText>{t('someoneVotedInPoll')}</MainText>,
        }
      }
      case UserActionType.VIEW_KEY_PAGE: {
        const { campaignName } = action
        return viewKeyPageRecentActivityRow({
          campaignName,
          countryCode,
          inStateOrEmpty,
        })
      }
      case UserActionType.LINKEDIN: {
        return {
          onFocusContent: hasJoinedLinkedIn
            ? undefined
            : () => (
                <UserActionFormFollowLinkedInDialog countryCode={countryCode}>
                  <Button>{t('follow')}</Button>
                </UserActionFormFollowLinkedInDialog>
              ),
          children: <MainText>{t('someoneFollowedLinkedIn')}</MainText>,
        }
      }
      case UserActionType.CLAIM_NFT: {
        return {
          onFocusContent: () =>
            action?.nftMint?.nftSlug ? (
              <UserActionFormClaimNFTDialog
                countryCode={countryCode}
                nftSlug={action?.nftMint?.nftSlug as NFTSlug}
              >
                <Button>{t('claimYours')}</Button>
              </UserActionFormClaimNFTDialog>
            ) : null,
          children: <MainText>{t('someoneClaimedNFT', { inState: inStateOrEmpty })}</MainText>,
        }
      }
      case UserActionType.SIGN_PETITION: {
        return {
          onFocusContent: () => (
            <Button asChild>
              <Link href={urls.petitions()}>{t('signPetitions')}</Link>
            </Button>
          ),
          children: <MainText>{t('someoneSignedPetition', { inState: inStateOrEmpty })}</MainText>,
        }
      }
    }
    return gracefullyError({
      // @ts-ignore
      msg: `Unknown action type in VariantRecentActivityRow for action ${action.id}: ${action.actionType}`,
      fallback: t('helpedCrypto'),
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
