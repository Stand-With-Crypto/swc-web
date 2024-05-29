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
    logger.info(`${humanReadablePageName} Error Page rendered with:`, error)
    Sentry.captureException(error, { tags: { domain } })

    if (checkIfErrorIsCausedByOutlook(error)) return

    const message = isIntentionalError
      ? `Testing Sentry Triggered ${humanReadablePageName} Error Page`
      : `${humanReadablePageName} Error Page Displayed`
    Sentry.captureMessage(message, { fingerprint: [`fingerprint-${message}`] })
    trackClientAnalytic('Error Page Visible', { Category: humanReadablePageName })
  }, [domain, error, humanReadablePageName])
}

// we are not sure what causes outlook users to trigger an anti-fingerprint error when accessing
// SWC using the parsed safe link from outlook. This is a fix to prevent errors spikes
// from showing up in Sentry and Mixpanel when new email campaigns are sent out.
// You can find more information about this issue here: https://github.com/Stand-With-Crypto/swc-web/issues/848
const OUTLOOK_BOT_ERROR_MESSAGE =
  'Non-Error promise rejection captured with value: Object Not Found'
function checkIfErrorIsCausedByOutlook(error: Error & { digest?: string }) {
  if (error?.message.includes(OUTLOOK_BOT_ERROR_MESSAGE)) {
    return true
  }

  if (error?.name.includes(OUTLOOK_BOT_ERROR_MESSAGE)) {
    return true
  }

  if (error?.digest && error?.digest.includes(OUTLOOK_BOT_ERROR_MESSAGE)) {
    return true
  }

  if (
    error?.cause &&
    typeof error?.cause === 'string' &&
    error?.cause.includes(OUTLOOK_BOT_ERROR_MESSAGE)
  ) {
    return true
  }

  if (error?.stack && error?.stack.includes(OUTLOOK_BOT_ERROR_MESSAGE)) {
    return true
  }

  return false
}
