'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/utils/web/cn'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { getIntlUrls } from '@/utils/shared/urls'
import { SupportedLocale } from '@/intl/locales'

import ManageCookiesModal from '@/components/app/cookieConsent/cookieConsentManageModal'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'

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
    <div className={cn('max-w-screen fixed bottom-0 left-0 w-full bg-secondary p-3 pb-2 md:p-6')}>
      <div className="container flex flex-col md:flex-row md:justify-between md:gap-5">
        <div className="relative">
          <button
            onClick={onRejectAll}
            className="relative right-[-4px] top-[-4px] float-right h-auto px-1 md:static md:hidden"
          >
            <div className="rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400">
              <X className="h-4 w-4" />
            </div>
          </button>
          <p className={cn('max-w-2xl text-justify text-xs text-muted-foreground md:text-left')}>
            We use our own and third-party cookies on our website to enhance your experience,
            analyze traffic, and for security. Cookies may collect your personal information, such
            as IP addresses or device identifiers, which we may disclose to our third-party
            partners. You may opt out of the cookies that are not strictly necessary by choosing
            from the below options. For more information, visit our{' '}
            <InternalLink className="underline" href={urls.privacyPolicy()}>
              Privacy Policy
            </InternalLink>
            .
          </p>
        </div>

        <div className={cn('flex items-center justify-between gap-4 md:justify-end')}>
          <div className="flex gap-4">
            <ManageCookiesModal onSubmit={onAcceptSpecificCookies}>
              <Button variant="link" className="p-0">
                Manage cookies
              </Button>
            </ManageCookiesModal>
            <Button variant="link" className="p-0" onClick={onRejectAll}>
              Reject all
            </Button>
          </div>
          {/* TODO: Change this to primary color once tailwind is configured properly */}
          <Button variant="link" className="p-0 px-4 text-blue-500 md:px-0" onClick={onAcceptAll}>
            Accept all
          </Button>
          <button onClick={onRejectAll} className="hidden md:block">
            <div className="rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400">
              <X className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
