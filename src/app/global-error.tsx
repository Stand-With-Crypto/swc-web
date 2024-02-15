'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Inter } from 'next/font/google'

import { ErrorPagesContent } from '@/components/app/errorPagesContent'
import { logger } from '@/utils/shared/logger'
import { cn } from '@/utils/web/cn'

const inter = Inter({ subsets: ['latin'] })
export const dynamic = 'error'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    const isIntentionalError = window.location.pathname.includes('debug-sentry')
    logger.info('Global Error Page rendered with:', error)
    Sentry.captureException(error, { tags: { domain: 'rootErrorPage' } })
    Sentry.captureException(
      new Error(
        isIntentionalError
          ? 'Testing Sentry Triggered Global Error Page'
          : 'Global Error Page Displayed',
      ),
    )
  }, [error])
  return (
    <html lang="en">
      <body className={cn(inter.className, 'flex h-screen content-center items-center')}>
        <ErrorPagesContent reset={reset} />
      </body>
    </html>
  )
}
