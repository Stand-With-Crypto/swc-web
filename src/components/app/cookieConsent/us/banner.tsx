'use client'

import { CookieConsentBanner } from '@/components/app/cookieConsent/common/banner'
import { CookieConsentBannerProps } from '@/components/app/cookieConsent/common/types'
import { USManageCookiesModal } from '@/components/app/cookieConsent/us/manageCookiesModal'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

const urls = getIntlUrls(SupportedCountryCodes.US)

export function USCookieConsentBanner({
  onAcceptSpecificCookies,
  onRejectAll,
  onAcceptAll,
}: CookieConsentBannerProps) {
  return (
    <CookieConsentBanner>
      <CookieConsentBanner.Content onRejectAll={onRejectAll}>
        <p className={cn('max-w-2xl text-justify text-xs text-muted-foreground md:text-left')}>
          We use our own and third-party cookies on our website to enhance your experience, analyze
          traffic, for marketing, and for security. You may opt out of the cookies that are not
          strictly necessary by choosing from the below options. For more information, visit our{' '}
          <InternalLink className="underline" href={urls.privacyPolicy()}>
            Privacy Policy
          </InternalLink>
          .
        </p>
      </CookieConsentBanner.Content>
      <CookieConsentBanner.Footer onAcceptAll={onAcceptAll} onRejectAll={onRejectAll}>
        <USManageCookiesModal onSubmit={onAcceptSpecificCookies}>
          <CookieConsentBanner.ManageCookiesButton>
            Manage cookies
          </CookieConsentBanner.ManageCookiesButton>
        </USManageCookiesModal>
      </CookieConsentBanner.Footer>
    </CookieConsentBanner>
  )
}
