import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export enum EUEmailActiveActions {
  TWEET = 'TWEET',
  REFER = 'REFER',
}

export interface EUEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
  language?: SupportedLanguages
}

const countryCode = SupportedCountryCodes.EU

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      tweetText: 'Tweet about crypto',
      tweetButton: 'Tweet',
      tweetSubtext: 'Share your thoughts on crypto with the world.',
      referText: 'Refer a friend',
      referButton: 'Refer a friend',
      referSubtext: 'Refer a friend to Stand With Crypto.',
    },
    fr: {
      tweetText: 'Tweeter sur crypto',
      tweetButton: 'Tweeter',
      tweetSubtext: 'Partagez vos pensées sur crypto avec le monde.',
      referText: 'Référez un ami',
      referButton: 'Référez un ami',
      referSubtext: 'Référez un ami à Stand With Crypto.',
    },
    de: {
      tweetText: 'Tweet über Krypto',
      tweetButton: 'Tweet',
      tweetSubtext: 'Teilen Sie Ihre Gedanken über Krypto mit der Welt.',
      referText: 'Freunde empfehlen',
      referButton: 'Freunde empfehlen',
      referSubtext: 'Freunde empfehlen Stand With Crypto.',
    },
  },
})

export function getEuActionsMetadataByType(language: SupportedLanguages = SupportedLanguages.EN) {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  // Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
  const EU_ACTIONS_METADATA_BY_TYPE: Record<
    EUEmailActiveActions,
    {
      image: string
      text: string
      subtext: string
      buttonLabel: string
      buttonHref: string
    }
  > = {
    [EUEmailActiveActions.TWEET]: {
      image: `/eu/actionTypeIcons/tweet.png`,
      text: t('tweetText'),
      subtext: t('tweetSubtext'),
      buttonLabel: t('tweetButton'),
      buttonHref: `/eu/${language}/action/share`,
    },
    [EUEmailActiveActions.REFER]: {
      image: `/eu/actionTypeIcons/refer.png`,
      text: t('referText'),
      subtext: t('referSubtext'),
      buttonLabel: t('referButton'),
      buttonHref: `/eu/${language}/action/refer`,
    },
  }

  return EU_ACTIONS_METADATA_BY_TYPE
}

export const EU_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_EU',
  linkedin: 'https://www.linkedin.com/company/stand-with-crypto-eu',
}
