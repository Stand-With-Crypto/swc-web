import { boolean, object } from 'zod'

import { OptionalCookieConsentTypes } from '@/utils/shared/cookieConsent'

export const zodManageCookieConsent = object({
  [OptionalCookieConsentTypes.FUNCTIONAL]: boolean(),
  [OptionalCookieConsentTypes.PERFORMANCE]: boolean(),
  [OptionalCookieConsentTypes.TARGETING]: boolean(),
})
