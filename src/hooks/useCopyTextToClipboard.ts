import React from 'react'
import { useCopyToClipboard } from 'react-use'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

export function useCopyTextToClipboard() {
  const [{ error, value }, copyToClipboard] = useCopyToClipboard()

  const handleClipboardError = React.useCallback(() => {
    toast.error('Failed to copy to clipboard, try again later.')
  }, [])

  React.useEffect(() => {
    if (error) {
      Sentry.captureException(error)
      handleClipboardError()
    }
    if (value) {
      toast.success('Copied to clipboard')
    }
  }, [error, value, handleClipboardError])

  const handleCopyNameToClipboard = React.useCallback(
    (val: string) => {
      if (!val) {
        Sentry.captureMessage('Failed to copy to clipboard, no data to write', {
          user: { val },
        })
        return handleClipboardError()
      }

      copyToClipboard(val)
    },
    [handleClipboardError, copyToClipboard],
  )
  return [value, handleCopyNameToClipboard] as const
}
