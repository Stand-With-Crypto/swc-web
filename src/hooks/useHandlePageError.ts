import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { logger } from 'ethers'

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
    Sentry.captureException(
      new Error(
        isIntentionalError
          ? `Testing Sentry Triggered ${humanReadablePageName} Error Page`
          : `${humanReadablePageName} Error Page Displayed`,
      ),
    )
  }, [domain, error, humanReadablePageName])
}
