import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  defaultCookieConsent,
  deserializeCookieConsent,
} from '@/utils/shared/cookieConsent'
import Cookies from 'js-cookie'

export let mutableClientCookieConsent: CookieConsentPermissions | null | undefined = null
export function setClientCookieConsent(val: CookieConsentPermissions | null) {
  mutableClientCookieConsent = val
}

export function getClientCookieConsent(): CookieConsentPermissions {
  if (mutableClientCookieConsent === null) {
    return defaultCookieConsent()
  }
  if (mutableClientCookieConsent) {
    return mutableClientCookieConsent
  }
  const cookieValue = Cookies.get(COOKIE_CONSENT_COOKIE_NAME)
  if (!cookieValue) {
    mutableClientCookieConsent = null
    return defaultCookieConsent()
  }
  const value = deserializeCookieConsent(cookieValue)
  mutableClientCookieConsent = value
  return value
}
