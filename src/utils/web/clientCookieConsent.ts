import Cookies from 'js-cookie'

import { AU_DEFAULT_VALUES } from '@/components/app/cookieConsent/au/cookiePreferencesForm'
import { CA_DEFAULT_VALUES } from '@/components/app/cookieConsent/ca/cookiePreferencesForm'
import { GB_DEFAULT_VALUES } from '@/components/app/cookieConsent/gb/cookiePreferencesForm'
import { US_DEFAULT_VALUES } from '@/components/app/cookieConsent/us/cookiePreferencesForm'
import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  DEFAULT_COOKIE_CONSENT,
  deserializeCookieConsent,
} from '@/utils/shared/cookieConsent'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

function getCountryDefaultCookieConsent(
  countryCode: SupportedCountryCodes,
): CookieConsentPermissions {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return US_DEFAULT_VALUES
    case SupportedCountryCodes.CA:
      return CA_DEFAULT_VALUES
    case SupportedCountryCodes.GB:
      return GB_DEFAULT_VALUES
    case SupportedCountryCodes.AU:
      return AU_DEFAULT_VALUES
    default:
      return gracefullyError({
        msg: `Country implementation not found for CookieConsent`,
        fallback: DEFAULT_COOKIE_CONSENT,
        hint: {
          level: 'error',
          tags: {
            domain: 'CookieConsent',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}

let mutableClientCookieConsent: CookieConsentPermissions | null | undefined = undefined
export function setClientCookieConsent(val: CookieConsentPermissions | null) {
  mutableClientCookieConsent = val
}

export function getClientCookieConsent(
  countryCode: SupportedCountryCodes,
): CookieConsentPermissions {
  if (mutableClientCookieConsent === null) {
    return getCountryDefaultCookieConsent(countryCode)
  }
  if (mutableClientCookieConsent) {
    return mutableClientCookieConsent
  }
  const cookieValue = Cookies.get(COOKIE_CONSENT_COOKIE_NAME)
  if (!cookieValue) {
    mutableClientCookieConsent = null
    return getCountryDefaultCookieConsent(countryCode)
  }
  const value = deserializeCookieConsent(cookieValue)
  mutableClientCookieConsent = value
  return value
}
