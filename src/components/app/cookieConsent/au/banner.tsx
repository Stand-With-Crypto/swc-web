'use client'

import { AUManageCookiesModal } from '@/components/app/cookieConsent/au/manageCookiesModal'
import { CookieConsentBanner } from '@/components/app/cookieConsent/common/banner'
import { CookieConsentBannerProps } from '@/components/app/cookieConsent/common/types'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

const urls = getIntlUrls(SupportedCountryCodes.AU)

export function AUCookieConsentBanner({
  onAcceptSpecificCookies,
  onAcceptAll,
  onRejectAll,
}: CookieConsentBannerProps) {
  return (
    <CookieConsentBanner>
      <CookieConsentBanner.Content onRejectAll={onRejectAll}>
        <p className={cn('max-w-2xl text-justify text-xs text-muted-foreground md:text-left')}>
          We use our own and third-party cookies on our website to enhance your experience, analyze
          traffic, for marketing, and for security. We require your consent for optional cookies
          that are not strictly necessary. You may opt in to these optional cookies by choosing from
          the below options. For more information, visit our{' '}
          <InternalLink className="underline" href={urls.privacyPolicy()}>
            Privacy Policy
          </InternalLink>
          .
        </p>
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
