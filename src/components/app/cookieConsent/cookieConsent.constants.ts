import { boolean, object } from 'zod'

export const COOKIE_CONSENT_COOKIE_NAME = 'SWC_COOKIE_CONSENT'

export type CookieConsentPermissions = Record<OptionalCookieConsentTypes, boolean>

export enum OptionalCookieConsentTypes {
  FUNCTIONAL = 'functional',
  PERFORMANCE = 'performance',
  TARGETING = 'targeting',
}

export const zodManageCookieConsent = object({
  [OptionalCookieConsentTypes.FUNCTIONAL]: boolean(),
  [OptionalCookieConsentTypes.PERFORMANCE]: boolean(),
  [OptionalCookieConsentTypes.TARGETING]: boolean(),
})
