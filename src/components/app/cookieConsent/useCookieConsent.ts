import Cookies from 'js-cookie'

import React from 'react'
import mixpanel from 'mixpanel-browser'
import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  serializeCookieConsent,
} from '@/utils/shared/cookieConsent'

export function useCookieConsent() {
  const [cookieConsentCookie, setCookieConsentCookie, removeCookieConsentCookie] = useCookieState(
    COOKIE_CONSENT_COOKIE_NAME,
  )

  const toggleProviders = React.useCallback((permissions: CookieConsentPermissions) => {
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
  }, [])

  const acceptSpecificCookies = React.useCallback(
    (consentCookie: CookieConsentPermissions): void => {
      setCookieConsentCookie(serializeCookieConsent(consentCookie))
      toggleProviders(consentCookie)
    },
    [setCookieConsentCookie, toggleProviders],
  )

  const acceptAllCookieValue = React.useMemo(
    () =>
      serializeCookieConsent({
        functional: true,
        performance: true,
        targeting: true,
      }),
    [],
  )

  const rejectAllCookieValue = React.useMemo(
    () =>
      serializeCookieConsent({
        functional: false,
        performance: false,
        targeting: false,
      }),
    [],
  )

  const rejectAllOptionalCookies = React.useCallback((): void => {
    setCookieConsentCookie(rejectAllCookieValue)
    toggleProviders({
      functional: false,
      performance: false,
      targeting: false,
    })
  }, [setCookieConsentCookie, rejectAllCookieValue, toggleProviders])

  const acceptAllCookies = React.useCallback((): void => {
    setCookieConsentCookie(acceptAllCookieValue)
    toggleProviders({
      functional: true,
      performance: true,
      targeting: true,
    })
  }, [setCookieConsentCookie, acceptAllCookieValue, toggleProviders])

  return {
    acceptSpecificCookies,
    rejectAllOptionalCookies,
    acceptAllCookies,
    resetCookieConsent: removeCookieConsentCookie,
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
  }, [value, name, options])

  const removeCookie = React.useCallback(() => {
    Cookies.remove(name)
  }, [name])

  return [value, setValue, removeCookie]
}
