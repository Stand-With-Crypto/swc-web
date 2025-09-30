import { useCallback, useEffect, useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'

import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

type CopiedValue = string | null

type CopyFn = (text: string) => Promise<void>

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      copiedToClipboard: 'Copied to clipboard',
      failedToCopy: 'Failed to copy to clipboard, try again later.',
    },
    de: {
      copiedToClipboard: 'In die Zwischenablage kopiert',
      failedToCopy: 'Fehler beim Kopieren in die Zwischenablage, versuchen Sie es später erneut.',
    },
    fr: {
      copiedToClipboard: 'Copié dans le presse-papiers',
      failedToCopy: 'Échec de la copie dans le presse-papiers, veuillez réessayer plus tard.',
    },
  },
})

export function useCopyTextToClipboard(): [CopiedValue, CopyFn, boolean] {
  const { t } = useTranslation(i18nMessages, 'useCopyTextToClipboard')

  const [copiedText, setCopiedText] = useState<CopiedValue>(null)
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    if (hasCopied) {
      toast.success(t('copiedToClipboard'), {
        id: 'copy-text-to-clipboard',
      })
      const timeout = setTimeout(() => {
        setHasCopied(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [hasCopied, t])

  const handleClipboardError = useCallback(() => {
    toast.error(t('failedToCopy'))
  }, [t])

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
