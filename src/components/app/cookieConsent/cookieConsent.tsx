'use client'

import { useCallback, useState } from 'react'
import { useIsPreviewing } from '@builder.io/react'

import { CookieConsentAction } from '@/components/app/cookieConsent/common/types'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AUCookieConsentBanner } from './au/banner'
import { CACookieConsentBanner } from './ca/banner'
import { GBCookieConsentBanner } from './gb/banner'
import { USCookieConsentBanner } from './us/banner'
import { useCookieConsent } from './useCookieConsent'

interface CookieConsentProps {
  countryCode: SupportedCountryCodes
  debug?: boolean
}

export function CookieConsent({
  countryCode,
  debug = process.env.NEXT_PUBLIC_DEBUG_COOKIE_CONSENT === 'true',
}: CookieConsentProps) {
  const isPreviewing = useIsPreviewing()
  const {
    acceptedCookies,
    hasGlobalPrivacyControl,
    acceptAllCookies,
    rejectAllOptionalCookies,
    acceptSpecificCookies,
  } = useCookieConsent()
  const [shouldShowBanner, setShouldShowBanner] = useState(() => debug || !acceptedCookies)

  const handleActionThenClose = useCallback(
    <T extends CookieConsentAction>(action: T) =>
      (param?: CookieConsentPermissions) => {
        action(param as CookieConsentPermissions)
        setShouldShowBanner(false)
      },
    [],
  )

  if (hasGlobalPrivacyControl || !shouldShowBanner || isPreviewing || isCypress) {
    return null
  }

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return (
        <USCookieConsentBanner
          onAcceptAll={handleActionThenClose(acceptAllCookies)}
          onAcceptSpecificCookies={handleActionThenClose(acceptSpecificCookies)}
          onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
        />
      )
    case SupportedCountryCodes.GB:
      return (
        <GBCookieConsentBanner
          onAcceptAll={handleActionThenClose(acceptAllCookies)}
          onAcceptSpecificCookies={handleActionThenClose(acceptSpecificCookies)}
          onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
        />
      )
    case SupportedCountryCodes.CA:
      return (
        <CACookieConsentBanner
          onAcceptAll={handleActionThenClose(acceptAllCookies)}
          onAcceptSpecificCookies={handleActionThenClose(acceptSpecificCookies)}
          onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
        />
      )
    case SupportedCountryCodes.AU:
      return (
        <AUCookieConsentBanner
          onAcceptAll={handleActionThenClose(acceptAllCookies)}
          onAcceptSpecificCookies={handleActionThenClose(acceptSpecificCookies)}
          onRejectAll={handleActionThenClose(rejectAllOptionalCookies)}
        />
      )
    default:
      return gracefullyError({
        msg: `Country implementation not found for CookieConsent`,
        fallback: null,
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
