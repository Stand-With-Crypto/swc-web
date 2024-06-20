import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

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
  useEffect(() => {
    const isIntentionalError = window.location.pathname.includes('debug-sentry')
    const errorSentryId = Sentry.captureException(error, { tags: { domain } })

    const message = isIntentionalError
      ? `Testing Sentry Triggered ${humanReadablePageName} Error Page`
      : `${humanReadablePageName} Error Page Displayed`
    const messageSentryId = Sentry.captureMessage(message, {
      fingerprint: [`fingerprint-${message}`],
      extra: {
        windowSearchParams: window.location.search,
        isIntentionalError,
        domain,
        errorSentryId,
        errorDigest: error?.digest,
      },
    })
    logger.info(
      `${humanReadablePageName} Error Page Displayed - SentryId: ${messageSentryId} - `,
      error,
    )
    trackClientAnalytic('Error Page Visible', {
      Category: humanReadablePageName,
      sentryId: messageSentryId,
    })
  }, [domain, error, humanReadablePageName])
}
