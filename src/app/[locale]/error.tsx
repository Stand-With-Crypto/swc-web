'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

import { ErrorPagesContent } from '@/components/app/errorPagesContent'
import { logger } from '@/utils/shared/logger'

export default function RootErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    const isIntentionalError = window.location.pathname.includes('debug-sentry')
    logger.info('Root Error Page rendered with:', error)
    Sentry.captureException(error, { tags: { domain: 'rootErrorPage' } })
    Sentry.captureException(
      new Error(
        isIntentionalError
          ? 'Testing Sentry Triggered Root Error Page'
          : 'Root Error Page Displayed',
      ),
    )
  }, [error])
  return <ErrorPagesContent reset={reset} />
}
