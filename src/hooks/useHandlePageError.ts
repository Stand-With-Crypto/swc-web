import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

import { logger } from '@/utils/shared/logger'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

function ignoreErrorOnMixpanel(error: Error) {
  return /Non-Error promise rejection captured with value: Object Not Found/.test(error.message)
}

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
    logger.info(`${humanReadablePageName} Error Page rendered with:`, error)
    Sentry.captureException(error, { tags: { domain } })
    const message = isIntentionalError
      ? `Testing Sentry Triggered ${humanReadablePageName} Error Page`
      : `${humanReadablePageName} Error Page Displayed`
    Sentry.captureMessage(message, { fingerprint: [`fingerprint-${message}`] })

    if (ignoreErrorOnMixpanel(error)) return

    trackClientAnalytic('Error Page Visible', { Category: humanReadablePageName })
  }, [domain, error, humanReadablePageName])
}
