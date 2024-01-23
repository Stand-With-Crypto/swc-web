'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { logger } from '@/utils/shared/logger'
import { ErrorPagesContent } from '@/components/app/errorPagesContent'
import { Inter } from 'next/font/google'
import { cn } from '@/utils/web/cn'

// TODO replace with font we want
const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={cn(inter.className, 'flex h-screen content-center items-center')}>
        <ErrorPagesContent reset={reset} />
      </body>
    </html>
  )
}
