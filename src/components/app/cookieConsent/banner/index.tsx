'use client'

import { useMemo } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/utils/web/cn'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { getIntlUrls } from '@/utils/shared/urls'
import { SupportedLocale } from '@/intl/locales'

import styles from './banner.module.css'
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
    <div
      className={cn(
        'max-w-screen fixed bottom-0 left-0 w-full bg-secondary p-4 pb-2 md:p-6',
        styles.banner,
      )}
    >
      <p className={cn('text-xs text-muted-foreground md:max-w-4xl', styles.description)}>
        We use our own and third-party cookies on our website to enhance your experience, analyze
        traffic, and for security. Cookies may collect your personal information, such as IP
        addresses or device identifiers, which we may disclose to our third-party partners. You may
        opt out of the cookies that are not strictly necessary by choosing from the below options.
        For more information, visit our{' '}
        <InternalLink className="underline" href={urls.privacyPolicy()}>
          Privacy Policy
        </InternalLink>
        .
      </p>

      <div className={cn('flex items-center gap-4 md:justify-end', styles.actions)}>
        <ManageCookiesModal onSubmit={onAcceptSpecificCookies} />
        <Button variant="link" className="p-0 font-bold" onClick={onRejectAll}>
          Reject all
        </Button>
        {/* TODO: Change this to primary color once tailwind is configured properly */}
        <Button variant="link" className="p-0 font-bold text-blue-500" onClick={onAcceptAll}>
          Accept all
        </Button>
      </div>

      <div className={cn('flex items-start justify-end md:items-center', styles.close)}>
        <button
          onClick={onRejectAll}
          className="h-auto rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
