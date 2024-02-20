'use client'
import { GoogleTagManager } from '@next/third-parties/google'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'

export function MaybeRenderGoogleTagManager() {
  const consent = useCookieConsent()
  if (consent.currentConsent?.targeting === false) {
    return null
  }
  return <GoogleTagManager gtmId="GTM-TKD5TBZW" />
}
