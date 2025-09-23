'use client'

import { ComponentMessages, I18nMessages } from '@/utils/shared/i18n/types'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const defaultEnglishMessages: ComponentMessages = {
  title: 'Component',
}

const i18nMessages: I18nMessages = {
  us: {
    en: defaultEnglishMessages,
  },
  au: {
    en: defaultEnglishMessages,
  },
  ca: {
    en: defaultEnglishMessages,
  },
  gb: {
    en: defaultEnglishMessages,
  },
  eu: {
    en: defaultEnglishMessages,
    fr: {
      title: 'Composant',
    },
    de: {
      title: 'Komponente',
    },
  },
}

export function ClientComponent() {
  const translator = useTranslation(i18nMessages)

  return <h1>{translator.t('title')}</h1>
}
