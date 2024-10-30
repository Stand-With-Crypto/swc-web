import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import mixpanel from 'mixpanel-browser'

import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  serializeCookieConsent,
} from '@/utils/shared/cookieConsent'
import { maybeInitClientAnalytics } from '@/utils/web/clientAnalytics'
import { setClientCookieConsent } from '@/utils/web/clientCookieConsent'

const REJECTED_VALUES = {
  functional: false,
  performance: false,
  targeting: false,
}

export function useCookieConsent() {
  const [cookieConsentCookie, setCookieConsentCookie, removeCookieConsentCookie] = useCookieState(
    COOKIE_CONSENT_COOKIE_NAME,
  )

  const hasGlobalPrivacyControl =
    typeof window !== 'undefined' && !!window.navigator?.globalPrivacyControl

  const toggleProviders = React.useCallback((permissions: CookieConsentPermissions) => {
    maybeInitClientAnalytics()
    if (!permissions.targeting) {
      mixpanel.opt_out_tracking()
    }
    if (permissions.targeting) {
      mixpanel.opt_in_tracking()
    }
  }, [])

  const acceptSpecificCookies = React.useCallback(
    (values: CookieConsentPermissions) => {
      setCookieConsentCookie(serializeCookieConsent(values))
      setClientCookieConsent(values)
      toggleProviders(values)
    },
    [setCookieConsentCookie, toggleProviders],
  )

  const rejectAllOptionalCookies = React.useCallback(() => {
    acceptSpecificCookies(REJECTED_VALUES)
  }, [acceptSpecificCookies])

  const acceptAllCookies = React.useCallback(() => {
    acceptSpecificCookies({
      functional: true,
      performance: true,
      targeting: true,
    })
  }, [acceptSpecificCookies])

  useEffect(() => {
    if (hasGlobalPrivacyControl) {
      setCookieConsentCookie(serializeCookieConsent(REJECTED_VALUES))
      setClientCookieConsent(REJECTED_VALUES)
    }
  }, [hasGlobalPrivacyControl, setCookieConsentCookie])

  return {
    acceptSpecificCookies,
    rejectAllOptionalCookies,
    acceptAllCookies,
    resetCookieConsent: removeCookieConsentCookie,
    acceptedCookies: !!cookieConsentCookie,
    hasGlobalPrivacyControl,
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
