import { AUFooterContent } from '@/components/app/authentication/au/footerContent'
import { CAFooterContent } from '@/components/app/authentication/ca/footerContent'
import { EUFooterContent } from '@/components/app/authentication/eu/footerContent'
import { GBFooterContent } from '@/components/app/authentication/gb/footerContent'
import { USFooterContent } from '@/components/app/authentication/us/footerContent'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { UseTranslationReturnType } from '@/utils/web/i18n/useTranslation'

export const ANALYTICS_NAME_LOGIN = 'Login'
export const ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC = 'User Action Success Join SWC'

const DEFAULT_TITLE = 'Join Stand With Crypto'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: DEFAULT_TITLE,
      subtitle:
        'Join the Stand With Crypto movement to make your voice heard in the European Union',
    },
    de: {
      title: 'Schließen Sie sich Stand With Crypto an',
      subtitle:
        'Schließen Sie sich der Stand With Crypto-Bewegung an, um Ihre Stimme in der Europäischen Union hörbar zu machen',
    },
    fr: {
      title: 'Rejoignez Stand With Crypto',
      subtitle:
        "Rejoignez le mouvement Stand With Crypto pour faire entendre votre voix dans l'Union européenne",
    },
  },
})

interface LoginContent {
  title: string
  subtitle: string
  footerContent: React.ComponentType
  iconSrc: string
}

export const COUNTRY_SPECIFIC_LOGIN_CONTENT: Record<
  SupportedCountryCodes,
  LoginContent | ((translation: UseTranslationReturnType) => LoginContent)
> = {
  [SupportedCountryCodes.US]: {
    title: DEFAULT_TITLE,
    subtitle:
      'Lawmakers and regulators are threatening the crypto industry. You can fight back and ask for sensible rules. Join the Stand With Crypto movement to make your voice heard in Washington D.C.',
    footerContent: USFooterContent,
    iconSrc: '/logo/shield.svg',
  },
  [SupportedCountryCodes.GB]: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in the UK',
    footerContent: GBFooterContent,
    iconSrc: '/gb/logo/shield.svg',
  },
  [SupportedCountryCodes.CA]: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in Canada',
    footerContent: CAFooterContent,
    iconSrc: '/ca/logo/shield.svg',
  },
  [SupportedCountryCodes.AU]: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in Australia',
    footerContent: AUFooterContent,
    iconSrc: '/au/logo/shield.svg',
  },
  [SupportedCountryCodes.EU]: translation => ({
    title: translation.t('title'),
    subtitle: translation.t('subtitle'),
    footerContent: () => <EUFooterContent language={translation.language} />,
    iconSrc: '/eu/logo/shield.svg',
  }),
}

export function getCountrySpecificLoginContent(
  countryCode: SupportedCountryCodes,
  translation: UseTranslationReturnType,
): LoginContent {
  const content = COUNTRY_SPECIFIC_LOGIN_CONTENT[countryCode]

  if (typeof content === 'function') {
    return content(translation)
  }
  return content
}
