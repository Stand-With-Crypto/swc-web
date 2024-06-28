import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

import { logger } from '@/utils/shared/logger'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'

const CHUNK_FAILED_MESSAGE = /Loading chunk [\d]+ failed/

function getErrorMessage({
  isIntentionalError,
  humanReadablePageName,
}: {
  isIntentionalError: boolean
  humanReadablePageName: string
}) {
  let message = `${humanReadablePageName} Error Page Displayed`

  if (isIntentionalError) {
    message = `Testing Sentry Triggered - ${message}`
  }

  return message
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
    const errorSentryId = Sentry.captureException(error, { tags: { domain } })
    const isChunkLoadError = CHUNK_FAILED_MESSAGE.test(error.message)

    const message = getErrorMessage({ isIntentionalError, humanReadablePageName })

    const messageSentryId = Sentry.captureMessage(message, {
      fingerprint: [`fingerprint-${message}`],
      extra: {
        windowSearchParams: window.location.search,
        isIntentionalError,
        isChunkLoadError,
        domain,
        errorSentryId,
        errorDigest: error?.digest,
      },
    })
    logger.info(`${message} - SentryId: ${messageSentryId}`, error)
    trackClientAnalytic('Error Page Visible', {
      Category: humanReadablePageName,
      sentryId: messageSentryId,
      Cause: isChunkLoadError ? 'ChunkLoadError' : undefined,
    })
  }, [domain, error, humanReadablePageName])
}
