import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const ANALYTICS_NAME_LOGIN = 'Login'
export const ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC = 'User Action Success Join SWC'

const DEFAULT_TITLE = 'Join Stand With Crypto'
const DEFAULT_SUBTITLE =
  'Lawmakers and regulators are threatening the crypto industry. You can fight back and ask for sensible rules. Join the Stand With Crypto movement to make your voice heard in Washington D.C.'
const DEFAULT_FOOTER_CONTENT =
  'By signing up with your phone number, you consent to receive recurring texts from Stand With Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply. You understand that Stand With Crypto and its vendors may collect and use your Personal Information.'

export const COUNTRY_SPECIFIC_LOGIN_CONTENT: Record<
  SupportedCountryCodes,
  {
    title: string
    subtitle: string
    footerContent: string
    iconSrc: string
  }
> = {
  [SupportedCountryCodes.US]: {
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    footerContent: DEFAULT_FOOTER_CONTENT,
    iconSrc: '/logo/shield.svg',
  },
  [SupportedCountryCodes.GB]: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in the UK',
    footerContent: DEFAULT_FOOTER_CONTENT,
    iconSrc: '/gb/logo/shield.svg',
  },
  [SupportedCountryCodes.CA]: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in Canada',
    footerContent: DEFAULT_FOOTER_CONTENT,
    iconSrc: '/ca/logo/shield.svg',
  },
  [SupportedCountryCodes.AU]: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in Australia',
    footerContent: DEFAULT_FOOTER_CONTENT,
    iconSrc: '/au/logo/shield.svg',
  },
}
