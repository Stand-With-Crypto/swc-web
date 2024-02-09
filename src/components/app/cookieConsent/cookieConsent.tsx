'use client'

import React from 'react'

import { SupportedLocale } from '@/intl/locales'

import { useCookieConsent } from './useCookieConsent'
import { CookieConsentBanner } from './banner'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'

interface CookieConsentProps {
  locale: SupportedLocale
  debug?: boolean
}

type CookieConsentAction = ((permissions: CookieConsentPermissions) => void) | (() => void)

export default function CookieConsent({
  locale,
  debug = process.env.NEXT_PUBLIC_DEBUG_COOKIE_CONSENT === 'true',
}: CookieConsentProps) {
  const { acceptAllCookies, rejectAllOptionalCookies, acceptSpecificCookies, acceptedCookies } =
    useCookieConsent()
  const [shouldShowBanner, setShouldShowBanner] = React.useState(() => debug || !acceptedCookies)

  const handleActionThenClose = React.useCallback(
    <T extends CookieConsentAction>(action: T) =>
      (param?: CookieConsentPermissions) => {
        action(param as CookieConsentPermissions)
        setShouldShowBanner(false)
      },
    [setShouldShowBanner],
  )

  if (!shouldShowBanner) {
    return null
  }

  return (
    <CookieConsentBanner
      locale={locale}
      onAcceptAll={handleActionThenClose(acceptAllCookies)}
      onAcceptSpecificCookies={handleActionThenClose(acceptSpecificCookies)}
      onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
    />
  )
}
