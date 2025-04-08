import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'

export type CookieConsentBannerProps = {
  onAcceptAll: () => void
  onAcceptSpecificCookies: (permissions: CookieConsentPermissions) => void
  onRejectAll: () => void
}

export type CookieConsentAction = ((permissions: CookieConsentPermissions) => void) | (() => void)
