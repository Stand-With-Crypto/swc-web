'use client'

import { ErrorPagesContent } from '@/components/app/errorPagesContent'
import { useHandlePageError } from '@/hooks/useHandlePageError'

export default function RootErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useHandlePageError({
    domain: 'rootErrorPage',
    humanReadablePageName: 'Root',
    error,
  })

  return <ErrorPagesContent reset={reset} />
}
