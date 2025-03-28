'use client'

import { CookieConsentBanner } from '@/components/app/cookieConsent/common/banner'
import { GBManageCookiesModal } from '@/components/app/cookieConsent/gb/manageCookiesModal'
import { InternalLink } from '@/components/ui/link'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export interface GBCookieConsentBannerProps {
  onAcceptSpecificCookies: (accepted: CookieConsentPermissions) => void
  onRejectAll: () => void
  onAcceptAll: () => void
}

export function GBCookieConsentBanner({
  onAcceptSpecificCookies,
  onAcceptAll,
  onRejectAll,
}: GBCookieConsentBannerProps) {
  const urls = getIntlUrls(SupportedCountryCodes.GB)

  return (
    <CookieConsentBanner>
      <CookieConsentBanner.Content onRejectAll={onRejectAll}>
        We use our own and third-party cookies on our website to enhance your experience, analyze
        traffic, for marketing, and for security. You may opt out of the cookies that are not
        strictly necessary by choosing from the below options. For more information, visit our{' '}
        <InternalLink className="underline" href={urls.privacyPolicy()}>
          Privacy Policy
        </InternalLink>
        .
      </CookieConsentBanner.Content>
      <CookieConsentBanner.Footer onAcceptAll={onAcceptAll} onRejectAll={onRejectAll}>
        <GBManageCookiesModal onSubmit={onAcceptSpecificCookies}>
          <CookieConsentBanner.ManageCookiesButton>
            Manage Cookies
          </CookieConsentBanner.ManageCookiesButton>
        </GBManageCookiesModal>
      </CookieConsentBanner.Footer>
    </CookieConsentBanner>
  )
}
