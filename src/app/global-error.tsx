'use client'

import { ErrorPagesContent } from '@/components/app/errorPagesContent'
import { useHandlePageError } from '@/hooks/useHandlePageError'
import { cn } from '@/utils/web/cn'
import { fontClassName } from '@/utils/web/fonts'

export const dynamic = 'error'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useHandlePageError({
    domain: 'rootErrorPage',
    humanReadablePageName: 'Global',
    error,
  })

  return (
    <html lang="en">
      <body className={cn(fontClassName, 'flex h-screen content-center items-center')}>
        <ErrorPagesContent reset={reset} />
      </body>
    </html>
  )
}
