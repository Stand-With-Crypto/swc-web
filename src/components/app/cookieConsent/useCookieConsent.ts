import Cookies from 'js-cookie'

import React from 'react'
import mixpanel from 'mixpanel-browser'
import {
  COOKIE_CONSENT_COOKIE_NAME,
  CookieConsentPermissions,
  serializeCookieConsent,
} from '@/utils/shared/cookieConsent'
import { setClientCookieConsent } from '@/utils/web/clientCookieConsent'

export function useCookieConsent() {
  const [cookieConsentCookie, setCookieConsentCookie, removeCookieConsentCookie] = useCookieState(
    COOKIE_CONSENT_COOKIE_NAME,
  )

  const toggleProviders = React.useCallback((permissions: CookieConsentPermissions) => {
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
    acceptSpecificCookies({
      functional: false,
      performance: false,
      targeting: false,
    })
  }, [acceptSpecificCookies])

  const acceptAllCookies = React.useCallback(() => {
    acceptSpecificCookies({
      functional: true,
      performance: true,
      targeting: true,
    })
  }, [acceptSpecificCookies])

  return {
    acceptAllCookies,
    acceptSpecificCookies,
    acceptedCookies: !!cookieConsentCookie,
    rejectAllOptionalCookies,
    resetCookieConsent: removeCookieConsentCookie,
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
