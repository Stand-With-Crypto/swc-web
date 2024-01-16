import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  deserializeCookieConsent,
} from '@/utils/shared/cookieConsent'
import Cookies from 'js-cookie'

export function getClientCookieConsent(): CookieConsentPermissions {
  const cookieValue = Cookies.get(COOKIE_CONSENT_COOKIE_NAME)
  if (!cookieValue) {
    return {
      functional: true,
      performance: true,
      targeting: true,
    }
  }
  return deserializeCookieConsent(cookieValue)
}
