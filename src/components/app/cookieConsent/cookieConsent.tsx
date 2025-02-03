'use client'

import React from 'react'
import { useIsPreviewing } from '@builder.io/react'

import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { CookieConsentBanner } from './banner'
import { useCookieConsent } from './useCookieConsent'

interface CookieConsentProps {
  countryCode: SupportedCountryCodes
  debug?: boolean
}

type CookieConsentAction = ((permissions: CookieConsentPermissions) => void) | (() => void)

export default function CookieConsent({
  countryCode,
  debug = process.env.NEXT_PUBLIC_DEBUG_COOKIE_CONSENT === 'true',
}: CookieConsentProps) {
  const isPreviewing = useIsPreviewing()
  const {
    acceptAllCookies,
    rejectAllOptionalCookies,
    acceptSpecificCookies,
    acceptedCookies,
    hasGlobalPrivacyControl,
  } = useCookieConsent()
  const [shouldShowBanner, setShouldShowBanner] = React.useState(() => debug || !acceptedCookies)

  const handleActionThenClose = React.useCallback(
    <T extends CookieConsentAction>(action: T) =>
      (param?: CookieConsentPermissions) => {
        action(param as CookieConsentPermissions)
        setShouldShowBanner(false)
      },
    [setShouldShowBanner],
  )

  if (hasGlobalPrivacyControl || !shouldShowBanner || isPreviewing || isCypress) {
    return null
  }

  return (
    <CookieConsentBanner
      countryCode={countryCode}
      onAcceptAll={handleActionThenClose(acceptAllCookies)}
      onAcceptSpecificCookies={handleActionThenClose(acceptSpecificCookies)}
      onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
    />
  )
}
