'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import NextError from 'next/error'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
    Sentry.captureException(new Error('Global Error Page Displayed'))
  }, [])
  return (
    <html lang="en">
      <body>
        {/* TODO graceful UI here */}
        <NextError statusCode={undefined as any} />
      </body>
    </html>
  )
}
