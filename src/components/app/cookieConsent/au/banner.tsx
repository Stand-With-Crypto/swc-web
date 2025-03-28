'use client'

import { AUManageCookiesModal } from '@/components/app/cookieConsent/au/manageCookiesModal'
import { CookieConsentBanner } from '@/components/app/cookieConsent/common/banner'
import { InternalLink } from '@/components/ui/link'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

export interface AUCookieConsentBannerProps {
  onAcceptSpecificCookies: (accepted: CookieConsentPermissions) => void
  onRejectAll: () => void
  onAcceptAll: () => void
}

export function AUCookieConsentBanner({
  onAcceptSpecificCookies,
  onAcceptAll,
  onRejectAll,
}: AUCookieConsentBannerProps) {
  const urls = getIntlUrls(SupportedCountryCodes.AU)

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
        <AUManageCookiesModal onSubmit={onAcceptSpecificCookies}>
          <CookieConsentBanner.ManageCookiesButton>
            Manage Cookies
          </CookieConsentBanner.ManageCookiesButton>
        </AUManageCookiesModal>
      </CookieConsentBanner.Footer>
    </CookieConsentBanner>
  )
}
