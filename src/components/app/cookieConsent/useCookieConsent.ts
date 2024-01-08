import Cookies from 'js-cookie'

import { OptionalCookieConsentTypes, COOKIE_CONSENT_COOKIE_NAME } from './cookieConsent.constants'
import React from 'react'

type CookieConsentPermissions = Record<OptionalCookieConsentTypes, boolean>

export function useCookieConsent() {
  const [cookieConsentCookie, setCookieConsentCookie] = useCookieState(COOKIE_CONSENT_COOKIE_NAME)

  const serializeConsentCookie = React.useCallback(
    (permissions: CookieConsentPermissions): string => {
      return Object.entries({ required: true, ...permissions })
        .map(([key, value]) => `${key}:${String(value)}`)
        .join(',')
    },
    [],
  )

  const acceptSpecificCookies = React.useCallback(
    (consentCookie: CookieConsentPermissions): void => {
      setCookieConsentCookie(serializeConsentCookie(consentCookie))
    },
    [serializeConsentCookie, setCookieConsentCookie],
  )

  const acceptAllCookieValue = React.useMemo(
    () =>
      serializeConsentCookie({
        functional: true,
        performance: true,
        targeting: true,
      }),
    [serializeConsentCookie],
  )

  const rejectAllCookieValue = React.useMemo(
    () =>
      serializeConsentCookie({
        functional: false,
        performance: false,
        targeting: false,
      }),
    [serializeConsentCookie],
  )

  const rejectAllOptionalCookies = React.useCallback((): void => {
    setCookieConsentCookie(rejectAllCookieValue)
  }, [setCookieConsentCookie, rejectAllCookieValue])

  const acceptAllCookies = React.useCallback((): void => {
    setCookieConsentCookie(acceptAllCookieValue)
  }, [setCookieConsentCookie, acceptAllCookieValue])

  return {
    acceptSpecificCookies,
    rejectAllOptionalCookies,
    acceptAllCookies,
    rejectAllCookieValue,
    acceptAllCookieValue,
    acceptedCookies: !!cookieConsentCookie,
  }
}

const DEFAULT_COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 365,
  sameSite: 'lax',
}

function useCookieState(
  name: string,
  options: Cookies.CookieAttributes = DEFAULT_COOKIE_OPTIONS,
): [string, (value: string) => void] {
  const [value, setValue] = React.useState(() => Cookies.get(name) ?? '')

  React.useEffect(() => {
    if (value) {
      Cookies.set(name, value, options)
    }
  }, [value, name])

  return [value, setValue]
}
