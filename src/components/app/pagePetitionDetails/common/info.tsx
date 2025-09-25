'use client'

import { StyledHtmlContent } from '@/components/ui/styledHtmlContent'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PetitionDetailsInfoProps {
  content: string
}

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      info: 'Info',
    },
    de: {
      info: 'Info',
    },
    fr: {
      info: 'Info',
    },
  },
})

export function PetitionDetailsInfo({ content }: PetitionDetailsInfoProps) {
  const { t } = useTranslation(i18nMessages, 'PetitionDetailsInfo')

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">{t('info')}</h2>
      <StyledHtmlContent className="[&_*]:text-fontcolor-muted" html={content} />
    </section>
  )
}
