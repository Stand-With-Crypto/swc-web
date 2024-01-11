import Cookies from 'js-cookie'

import { COOKIE_CONSENT_COOKIE_NAME, CookieConsentPermissions } from './cookieConsent.constants'
import React from 'react'
import mixpanel from 'mixpanel-browser'

export function useCookieConsent() {
  const [cookieConsentCookie, setCookieConsentCookie, removeCookieConsentCookie] = useCookieState(
    COOKIE_CONSENT_COOKIE_NAME,
  )

  const serializeConsentCookie = React.useCallback(
    (permissions: CookieConsentPermissions): string => {
      /*
      to be conservative, if someone opts out of functional or performance, we should assume
      they don't want targeting either
      */
      if (!permissions.functional || !permissions.performance || !permissions.targeting) {
        mixpanel.opt_out_tracking()
      }
      if (permissions.functional && permissions.performance && permissions.targeting) {
        mixpanel.opt_in_tracking()
      }
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
    resetCookieConsent: removeCookieConsentCookie,
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
): [string, (value: string) => void, () => void] {
  const [value, setValue] = React.useState(() => Cookies.get(name) ?? '')

  React.useEffect(() => {
    if (value) {
      Cookies.set(name, value, options)
    }
  }, [value, name])

  const removeCookie = React.useCallback(() => {
    Cookies.remove(name)
  }, [name])

  return [value, setValue, removeCookie]
}
