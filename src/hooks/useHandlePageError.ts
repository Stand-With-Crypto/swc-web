import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useSearchParams } from 'next/navigation'

import { logger } from '@/utils/shared/logger'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

export function useHandlePageError({
  domain,
  humanReadablePageName,
  error,
}: {
  domain: string
  humanReadablePageName: string
  error: Error & { digest?: string }
}) {
  const searchParams = useSearchParams()
  const isFromNewsletter = searchParams ? searchParams.get('utm_medium') === 'newsletter' : false

  useEffect(() => {
    const isIntentionalError = window.location.pathname.includes('debug-sentry')
    logger.info(`${humanReadablePageName} Error Page rendered with:`, error)
    Sentry.captureException(error, { tags: { domain } })
    const message = isIntentionalError
      ? `Testing Sentry Triggered ${humanReadablePageName} Error Page`
      : `${humanReadablePageName} Error Page Displayed`
    Sentry.captureMessage(message, { fingerprint: [`fingerprint-${message}`] })
    trackClientAnalytic('Error Page Visible', {
      Category: humanReadablePageName,
      ...(checkIfErrorIsCausedByOutlook(error, isFromNewsletter) && { Cause: 'Outlook' }),
    })
  }, [domain, error, humanReadablePageName, isFromNewsletter])
}

// we are not sure what causes outlook users to trigger an anti-fingerprint error when accessing
// SWC using the parsed safe link from outlook. This is a fix to prevent errors spikes
// from showing up in Sentry and Mixpanel when new email campaigns are sent out.
// You can find more information about this issue here: https://github.com/Stand-With-Crypto/swc-web/issues/848
const OUTLOOK_BOT_ERROR_MESSAGE = [
  'Object Not Found Matching Id:',
  'antifingerprint not defined yet',
]
function checkIfErrorIsCausedByOutlook(
  error: Error & { digest?: string },
  isFromNewsletter: boolean,
) {
  if (!isFromNewsletter) return false

  if (
    typeof error !== typeof Error &&
    OUTLOOK_BOT_ERROR_MESSAGE.some(errorMsg => error?.toString()?.includes(errorMsg))
  ) {
    return true
  }

  if (OUTLOOK_BOT_ERROR_MESSAGE.some(errorMsg => error?.message?.includes(errorMsg))) return true
  if (OUTLOOK_BOT_ERROR_MESSAGE.some(errorMsg => error?.name?.includes(errorMsg))) return true
  if (
    error?.digest &&
    OUTLOOK_BOT_ERROR_MESSAGE.some(errorMsg => error?.digest?.includes(errorMsg))
  ) {
    return true
  }
  if (
    error?.stack &&
    OUTLOOK_BOT_ERROR_MESSAGE.some(errorMsg => error?.stack?.includes(errorMsg))
  ) {
    return true
  }

  return false
}
