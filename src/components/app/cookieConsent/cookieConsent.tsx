'use client'

import { SupportedLocale } from '@/intl/locales'
import { useCookieConsent } from './useCookieConsent'
import { CookieConsentBanner } from '@/components/app/cookieConsent/banner'
import React from 'react'

interface CookieConsentProps {
  locale: SupportedLocale
  debug?: boolean
}

export default function CookieConsent({
  locale,
  debug = process.env.NEXT_PUBLIC_DEBUG_COOKIE_CONSENT === 'true',
}: CookieConsentProps) {
  const { acceptAllCookies, rejectAllOptionalCookies, acceptSpecificCookies, acceptedCookies } =
    useCookieConsent()
  const [shouldShowBanner, setShouldShowBanner] = React.useState(() => debug || !acceptedCookies)

  const handleActionThenClose = React.useCallback(
    (action: () => void) => () => {
      action()
      setShouldShowBanner(false)
    },
    [setShouldShowBanner],
  )

  if (!shouldShowBanner) {
    return null
  }

  return (
    <>
      <CookieConsentBanner
        locale={locale}
        onAcceptAll={handleActionThenClose(acceptAllCookies)}
        onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
        onManageCookies={() => alert('hello world')}
      />
    </>
  )
}
