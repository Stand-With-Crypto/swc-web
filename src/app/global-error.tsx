'use client'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    REPLACE_ME__captureException(error)
    REPLACE_ME__captureException(new Error('Global Error Page Displayed'))
  }, [])
  return (
    <html lang="en">
      <body>{/* TODO */}</body>
    </html>
  )
}
