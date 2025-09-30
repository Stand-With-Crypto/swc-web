'use client'

import Balancer from 'react-wrap-balancer'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { useDialog } from '@/hooks/useDialog'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      sendFeedbackCTA: 'Send feedback',
      dialogTitle: 'Send Feedback',
      dialogBody:
        'We’d love to hear from you! If you have any thoughts, suggestions, or comments, feel free to share them with us at the email below.',
      copied: 'Copied!',
      copyEmailToClipboard: 'Copy email to clipboard',
    },
    de: {
      sendFeedbackCTA: 'Feedback senden',
      dialogTitle: 'Feedback senden',
      dialogBody:
        'Wir würden gerne von Ihnen hören! Wenn Sie irgendwelche Gedanken, Vorschläge oder Kommentare haben, teilen Sie uns diese gerne per E-Mail mit.',
      copied: 'Kopiert!',
      copyEmailToClipboard: 'E-Mail kopieren',
    },
    fr: {
      sendFeedbackCTA: 'Envoyer un feedback',
      dialogTitle: 'Envoyer un feedback',
      dialogBody:
        "Nous aimerions vous entendre ! Si vous avez des idées, suggestions ou commentaires, n'hésitez pas à les partager avec nous via l'e-mail ci-dessous.",
      copied: 'Copié !',
      copyEmailToClipboard: "Copier l'e-mail dans le presse-papiers",
    },
  },
})

export function SendFeedbackButton({ href }: { href: string }) {
  const { t } = useTranslation(i18nMessages, 'SendFeedbackButton')

  const dialogProps = useDialog({ analytics: 'Send-Feedback-Dialog' })
  const [copiedValue, handleCopyToClipboard] = useCopyTextToClipboard()

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger className="block text-gray-400 hover:underline">
        {t('sendFeedbackCTA')}
      </DialogTrigger>
      <DialogContent a11yTitle="Send Feedback" className="pb-4 pt-0">
        <DialogBody className="flex flex-col justify-between">
          <div>
            <DialogTitle className="text-center text-2xl">{t('dialogTitle')}</DialogTitle>
            <p className="py-6 text-center text-muted-foreground">
              <Balancer>{t('dialogBody')}</Balancer>
            </p>
            <div className="rounded-md bg-muted p-4 text-center font-semibold">{href}</div>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleCopyToClipboard(href)}
            size="lg"
            variant="primary-cta"
          >
            {copiedValue ? t('copied') : t('copyEmailToClipboard')}
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
