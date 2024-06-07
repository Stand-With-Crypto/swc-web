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
// SWC using the parsed safe link from outlook. This fix was added to track the error
// You can find more information about this issue here: https://github.com/Stand-With-Crypto/swc-web/issues/848
const OUTLOOK_BOT_ERROR_MESSAGE = 'Non-Error promise rejection captured with value: '

function checkIfErrorIsCausedByOutlook(error: any, isFromNewsletter: boolean) {
  if (!isFromNewsletter) return false

  // The conditional logic below was inspired by this suggestion https://github.com/getsentry/sentry-javascript/issues/3440#issuecomment-828834651 as an attempt to try to catch the outlook error
  if (
    typeof error !== 'undefined' &&
    typeof error?.exception !== 'undefined' &&
    typeof error?.exception?.values !== 'undefined' &&
    error?.exception?.values?.length === 1
  ) {
    const exception = error.exception.values[0]
    if (
      exception.type === 'UnhandledRejection' &&
      exception.value?.includes(OUTLOOK_BOT_ERROR_MESSAGE)
    ) {
      return true
    }
  }

  return false
}
