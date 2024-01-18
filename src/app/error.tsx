'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import NextError from 'next/error'
import { logger } from '@/utils/shared/logger'

export default function RootErrorPage({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    logger.info('RootErrorPage rendered with:', error)
    Sentry.captureException(error)
    Sentry.captureException(new Error('Root Error Page Displayed'))
  }, [error])
  return (
    <html lang="en">
      <body>
        {/* TODO graceful UI here */}
        <NextError statusCode={undefined as any} />
      </body>
    </html>
  )
}
