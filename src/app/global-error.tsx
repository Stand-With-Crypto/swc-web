'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { logger } from '@/utils/shared/logger'
import { ErrorPagesContent } from '@/components/app/errorPagesContent'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.info('GlobalErrorPage rendered with:', error)
    Sentry.captureException(error)
    Sentry.captureException(new Error('Global Error Page Displayed'))
  }, [error])
  return (
    <html>
      <body>
        <ErrorPagesContent reset={reset} />
      </body>
    </html>
  )
}
