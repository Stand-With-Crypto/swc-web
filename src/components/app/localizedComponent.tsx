import { ReactNode } from 'react'

import { DEFAULT_LOCALE, SupportedLocale } from '@/intl/locales'

interface LocalizedComponentProps {
  locale: SupportedLocale
  options: Record<SupportedLocale, ReactNode>
  fallbackLocale?: SupportedLocale
}

export function LocalizedComponent({
  locale,
  options,
  fallbackLocale = DEFAULT_LOCALE,
}: LocalizedComponentProps) {
  if (!options[fallbackLocale]) {
    throw new Error(`Content for fallback locale "${fallbackLocale}" is missing`)
  }

  return options[locale] ?? options[fallbackLocale]
}
