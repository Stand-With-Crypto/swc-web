import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormFollowLinkedInDialog } from '@/components/app/userActionFormFollowOnLinkedIn/common/dialog'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  EUUserActionLinkedInCampaignName,
  EUUserActionReferCampaignName,
  EUUserActionSignPetitionCampaignName,
  EUUserActionTweetCampaignName,
} from '@/utils/shared/userActionCampaigns/eu/euUserActionCampaigns'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      optInTitle: 'Join Stand With Crypto',
      optInDescription: 'Join the movement to make your voice heard.',
      linkedinTitle: 'Follow us on LinkedIn',
      linkedinDescription:
        'Follow us on LinkedIn and stay up to date on crypto policy changes in Europe.',
      xTitle: 'Follow us on X',
      xDescription: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
      xMobileCTADescription: 'Stay up to date on crypto policy.',
      referTitle: 'Refer a friend',
      referDescription: 'Get your friend to signup for Stand With Crypto and verify their account.',
      referMobileCTADescription:
        'Get your friend to signup for Stand With Crypto and verify their account.',
      referCampaignsModalDescription:
        'Share your referral link with friends to help grow our movement.',
      referCampaignDescription: 'You have referred friends to join Stand With Crypto.',
      signPetitionTitle: 'Sign the petition',
      signPetitionDescription: 'Set out a pro-innovation strategy for stablecoins in Europe',
    },
    fr: {
      optInTitle: 'Rejoignez Stand With Crypto',
      optInDescription: 'Rejoignez le mouvement pour faire entendre votre voix.',
      linkedinTitle: 'Suivez-nous sur LinkedIn',
      linkedinDescription:
        'Suivez-nous sur LinkedIn et restez informés des changements de politique crypto en Europe.',
      xTitle: 'Suivez-nous sur X',
      xDescription: 'Restez informés des changements de politique crypto en Europe.',
      xMobileCTADescription: 'Restez informés des changements de politique crypto en Europe.',
      referTitle: 'Parrainer un ami',
      referDescription:
        "Invitez votre ami à s'inscrire à Stand With Crypto et à vérifier son compte.",
      referMobileCTADescription:
        "Invitez votre ami à s'inscrire à Stand With Crypto et à vérifier son compte.",
      referCampaignsModalDescription:
        'Partagez votre lien de parrainage avec vos amis pour aider à développer notre mouvement.',
      referCampaignDescription: 'Vous avez parrainé des amis pour rejoindre Stand With Crypto.',
      signPetitionTitle: 'Signer la pétition',
      signPetitionDescription:
        'Proposez une stratégie pro-innovation pour les stablecoins en Europe',
    },
    de: {
      optInTitle: 'Tritt Stand With Crypto bei',
      optInDescription: 'Beteilige dich am Weg zum Erfolg für Cryptocurrencies in Europa.',
      linkedinTitle: 'Folge uns auf LinkedIn',
      linkedinDescription:
        'Folge uns auf LinkedIn und bleibe auf dem Laufenden über Änderungen der Krypto-Politik in Europa.',
      xTitle: 'Folge uns auf X',
      xDescription: 'Bleibe auf dem Laufenden über Änderungen der Krypto-Politik in Europa.',
      xMobileCTADescription:
        'Bleibe auf dem Laufenden über Änderungen der Krypto-Politik in Europa.',
      referTitle: 'Einen Freund empfehlen',
      referDescription:
        'Lass deinen Freund sich bei Stand With Crypto anmelden und sein Konto verifizieren.',
      referMobileCTADescription:
        'Lass deinen Freund sich bei Stand With Crypto anmelden und sein Konto verifizieren.',
      referCampaignsModalDescription:
        'Teile deinen Empfehlungslink mit Freunden, um unsere Bewegung zu vergrößern.',
      referCampaignDescription: 'Du hast Freunde empfohlen, Stand With Crypto beizutreten.',
      signPetitionTitle: 'Petition unterschreiben',
      signPetitionDescription:
        'Vorschlagen Sie eine pro-Innovation-Strategie für Stablecoins in Europa',
    },
  },
})

const countryCode = SupportedCountryCodes.EU

export function getEuUserActionCtasForGridDisplay(
  language = SupportedLanguages.EN,
): UserActionGridCTA {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  const urls = getIntlUrls(countryCode, { language })

  return {
    [UserActionType.OPT_IN]: {
      title: t('optInTitle'),
      description: t('optInDescription'),
      mobileCTADescription: t('optInDescription'),
      campaignsModalDescription: t('optInDescription'),
      image: '/eu/actionTypeIcons/opt-in.png',
      campaigns: [
        {
          actionType: UserActionType.OPT_IN,
          campaignName: UserActionOptInCampaignName.DEFAULT,
          isCampaignActive: true,
          title: t('optInTitle'),
          description: t('optInDescription'),
          canBeTriggeredMultipleTimes: false,
          WrapperComponent: ({ children }) => (
            <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
          ),
        },
      ],
    },
    [UserActionType.TWEET]: {
      title: t('xTitle'),
      description: t('xDescription'),
      mobileCTADescription: t('xMobileCTADescription'),
      campaignsModalDescription: t('xDescription'),
      image: '/eu/actionTypeIcons/tweet.png',
      campaigns: [
        {
          actionType: UserActionType.TWEET,
          campaignName: EUUserActionTweetCampaignName.DEFAULT,
          isCampaignActive: true,
          title: t('xTitle'),
          description: t('xDescription'),
          canBeTriggeredMultipleTimes: true,
          WrapperComponent: ({ children }) => (
            <UserActionFormShareOnTwitterDialog countryCode={countryCode}>
              {children}
            </UserActionFormShareOnTwitterDialog>
          ),
        },
      ],
    },
    [UserActionType.REFER]: {
      title: t('referTitle'),
      description: t('referDescription'),
      mobileCTADescription: t('referMobileCTADescription'),
      campaignsModalDescription: t('referCampaignsModalDescription'),
      image: '/eu/actionTypeIcons/refer.png',
      campaigns: [
        {
          actionType: UserActionType.REFER,
          campaignName: EUUserActionReferCampaignName.DEFAULT,
          isCampaignActive: true,
          title: t('referTitle'),
          description: t('referCampaignDescription'),
          canBeTriggeredMultipleTimes: true,
          WrapperComponent: ({ children }) => (
            <LoginDialogWrapper
              authenticatedContent={
                <UserActionFormReferDialog countryCode={countryCode}>
                  {children}
                </UserActionFormReferDialog>
              }
            >
              {children}
            </LoginDialogWrapper>
          ),
        },
      ],
    },
    [UserActionType.LINKEDIN]: {
      title: t('linkedinTitle'),
      description: t('linkedinDescription'),
      mobileCTADescription: t('linkedinDescription'),
      campaignsModalDescription: t('linkedinDescription'),
      image: '/eu/actionTypeIcons/follow-linkedin.png',
      campaigns: [
        {
          actionType: UserActionType.LINKEDIN,
          campaignName: EUUserActionLinkedInCampaignName.DEFAULT,
          isCampaignActive: true,
          title: t('linkedinTitle'),
          description: t('linkedinDescription'),
          canBeTriggeredMultipleTimes: true,
          WrapperComponent: ({ children }) => (
            <UserActionFormFollowLinkedInDialog countryCode={countryCode}>
              {children}
            </UserActionFormFollowLinkedInDialog>
          ),
        },
      ],
    },
    [UserActionType.SIGN_PETITION]: {
      title: t('signPetitionTitle'),
      description: t('signPetitionDescription'),
      mobileCTADescription: t('signPetitionDescription'),
      campaignsModalDescription: t('signPetitionDescription'),
      image: '/actionTypeIcons/petition.svg',
      link: ({ children }) => (
        <Link
          className="w-full"
          href={urls.petitionDetails(
            EUUserActionSignPetitionCampaignName.STRATEGY_FOR_STABLECOINS_2025,
          )}
        >
          {children}
        </Link>
      ),
      campaigns: [
        {
          actionType: UserActionType.SIGN_PETITION,
          campaignName: EUUserActionSignPetitionCampaignName.STRATEGY_FOR_STABLECOINS_2025,
          isCampaignActive: true,
          title: t('signPetitionTitle'),
          description: t('signPetitionDescription'),
          canBeTriggeredMultipleTimes: true,
          WrapperComponent: null,
        },
      ],
    },
  }
}
