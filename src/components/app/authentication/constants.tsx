import { AUFooterContent } from '@/components/app/authentication/au/footerContent'
import { CAFooterContent } from '@/components/app/authentication/ca/footerContent'
import { GBFooterContent } from '@/components/app/authentication/gb/footerContent'
import { USFooterContent } from '@/components/app/authentication/us/footerContent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const ANALYTICS_NAME_LOGIN = 'Login'
export const ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC = 'User Action Success Join SWC'

const DEFAULT_TITLE = 'Join Stand With Crypto'

export const COUNTRY_SPECIFIC_LOGIN_CONTENT: Record<
  SupportedCountryCodes,
  {
    title: string
    subtitle: string
    footerContent: React.ComponentType
    iconSrc: string
  }
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
}
