'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'

import ManageCookiesModal from '@/components/app/cookieConsent/cookieConsentManageModal'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface CookieConsentBannerProps {
  locale: SupportedLocale
  onAcceptSpecificCookies: (accepted: CookieConsentPermissions) => void
  onRejectAll: () => void
  onAcceptAll: () => void
}

export function CookieConsentBanner({
  locale,
  onAcceptSpecificCookies,
  onAcceptAll,
  onRejectAll,
}: CookieConsentBannerProps) {
  const urls = useMemo(() => getIntlUrls(locale), [locale])

  return (
    <div
      className={cn('max-w-screen fixed bottom-0 left-0 z-10 w-full bg-secondary p-3 pb-2 md:p-6')}
    >
      <div className="flex flex-col md:container md:flex-row md:justify-between md:gap-5">
        <div className="relative">
          <button
            className="relative right-[-4px] top-[-4px] float-right h-auto px-1 md:static md:hidden"
            onClick={onRejectAll}
          >
            <div className="rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400">
              <X className="h-4 w-4" />
            </div>
          </button>
          <p className={cn('max-w-2xl text-justify text-xs text-muted-foreground md:text-left')}>
            We use our own and third-party cookies on our website to enhance your experience,
            analyze traffic, for marketing, and for security. You may opt out of the cookies that
            are not strictly necessary by choosing from the below options. For more information,
            visit our{' '}
            <InternalLink className="underline" href={urls.privacyPolicy()}>
              Privacy Policy
            </InternalLink>
            .
          </p>
        </div>

        <div className={cn('mb-2 flex items-center justify-between gap-4 md:mb-0 md:justify-end')}>
          <div className="flex gap-4">
            <ManageCookiesModal locale={locale} onSubmit={onAcceptSpecificCookies}>
              <Button className="px-0 py-4" variant="link">
                Manage cookies
              </Button>
            </ManageCookiesModal>
            <Button className="px-0 py-4" onClick={onRejectAll} variant="link">
              Reject all
            </Button>
          </div>
          <Button
            className="px-4 py-4 font-bold text-primary-cta md:px-0"
            onClick={onAcceptAll}
            variant="link"
          >
            Accept all
          </Button>
          <button className="hidden md:block" onClick={onRejectAll}>
            <div className="rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400">
              <X className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
