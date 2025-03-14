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
  }
> = {
  us: {
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    footerContent: DEFAULT_FOOTER_CONTENT,
  },
  gb: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in London',
    footerContent: DEFAULT_FOOTER_CONTENT,
  },
  ca: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in Ottawa',
    footerContent: DEFAULT_FOOTER_CONTENT,
  },
  au: {
    title: DEFAULT_TITLE,
    subtitle: 'Join the Stand With Crypto movement to make your voice heard in Canberra',
    footerContent: DEFAULT_FOOTER_CONTENT,
  },
}
