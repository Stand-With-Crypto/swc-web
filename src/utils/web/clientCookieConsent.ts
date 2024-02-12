import Cookies from 'js-cookie'

import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  DEFAULT_COOKIE_CONSENT,
  deserializeCookieConsent,
} from '@/utils/shared/cookieConsent'

export let mutableClientCookieConsent: CookieConsentPermissions | null | undefined = undefined
export function setClientCookieConsent(val: CookieConsentPermissions | null) {
  mutableClientCookieConsent = val
}

export function getClientCookieConsent(): CookieConsentPermissions {
  if (mutableClientCookieConsent === null) {
    return DEFAULT_COOKIE_CONSENT
  }
  if (mutableClientCookieConsent) {
    return mutableClientCookieConsent
  }
  const cookieValue = Cookies.get(COOKIE_CONSENT_COOKIE_NAME)
  if (!cookieValue) {
    mutableClientCookieConsent = null
    return DEFAULT_COOKIE_CONSENT
  }
  const value = deserializeCookieConsent(cookieValue)
  mutableClientCookieConsent = value
  return value
}
