import { OptionalCookieConsentTypes } from '@/utils/shared/cookieConsent'
import { boolean, object } from 'zod'

export const zodManageCookieConsent = object({
  [OptionalCookieConsentTypes.FUNCTIONAL]: boolean(),
  [OptionalCookieConsentTypes.PERFORMANCE]: boolean(),
  [OptionalCookieConsentTypes.TARGETING]: boolean(),
})
