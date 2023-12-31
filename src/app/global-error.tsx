'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    Sentry.captureException(new Error('Global Error Page Displayed'))
  }, [])
  return (
    <html lang="en">
      <body>{/* TODO */}</body>
    </html>
  )
}
