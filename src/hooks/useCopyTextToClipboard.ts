import { useCallback, useEffect, useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

type CopiedValue = string | null

type CopyFn = (text: string) => Promise<void>

export function useCopyTextToClipboard(): [CopiedValue, CopyFn, boolean] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    if (hasCopied) {
      toast.success('Copied to clipboard', {
        id: 'copy-text-to-clipboard',
      })
      const timeout = setTimeout(() => {
        setHasCopied(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [hasCopied])

  const handleClipboardError = useCallback(() => {
    toast.error('Failed to copy to clipboard, try again later.')
  }, [])

  const copy: CopyFn = useCallback(
    async text => {
      if (!navigator?.clipboard) {
        Sentry.captureMessage('Clipboard not supported', {
          extra: {
            text,
            navigator: navigator.userAgent,
          },
          tags: { domain: 'useCopyTextToClipboard' },
        })
        return handleClipboardError()
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopiedText(text)
        setHasCopied(true)
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            text,
            navigator: navigator.userAgent,
          },
          tags: { domain: 'useCopyTextToClipboard' },
        })
        handleClipboardError()
        setCopiedText(null)
        setHasCopied(false)
      }
    },
    [handleClipboardError],
  )

  return [copiedText, copy, hasCopied]
}
