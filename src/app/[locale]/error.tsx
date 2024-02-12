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
    logger.info('Root Error Page rendered with:', error)
    Sentry.captureException(error)
    Sentry.captureException(new Error('Root Error Page Displayed'))
  }, [error])
  return <ErrorPagesContent reset={reset} />
}
