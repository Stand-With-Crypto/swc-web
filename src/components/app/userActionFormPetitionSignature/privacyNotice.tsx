import Link from 'next/link'

import { cn } from '@/utils/web/cn'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PrivacyNoticeProps {
  className?: string
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      privacyNoticePreLink:
        'By submitting, I understand that Stand With Crypto and its vendors may collect and use my personal information subject to the ',
      privacyNoticeLinkText: 'SWC Privacy Policy',
    },
    de: {
      privacyNoticePreLink:
        'Mit dem Absenden erkläre ich mich damit einverstanden, dass Stand With Crypto und seine Anbieter meine personenbezogenen Daten gemäß ',
      privacyNoticeLinkText: 'der SWC-Datenschutzrichtlinie',
    },
    fr: {
      privacyNoticePreLink:
        'En soumettant ce formulaire, je reconnais que Stand With Crypto et ses fournisseurs peuvent collecter et utiliser mes données personnelles conformément à ',
      privacyNoticeLinkText: 'la Politique de confidentialité de SWC',
    },
  },
})

export function PrivacyNotice({ className }: PrivacyNoticeProps) {
  const { t } = useTranslation(i18nMessages, 'PetitionSignaturePrivacyNotice')

  return (
    <div className={cn('text-center text-xs text-muted-foreground', className)}>
      {t('privacyNoticePreLink')}
      <Link className="underline" href="/privacy" target="_blank">
        {t('privacyNoticeLinkText')}
      </Link>
      .
    </div>
  )
}
