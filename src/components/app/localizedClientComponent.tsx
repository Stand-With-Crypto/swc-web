'use client'

import { ReactNode } from 'react'

import { useLocale } from '@/hooks/useLocale'
import { DEFAULT_LOCALE, SupportedLocale } from '@/intl/locales'

interface LocalizedComponentProps {
  options: Record<SupportedLocale, ReactNode>
  fallbackLocale?: SupportedLocale
}

export function LocalizedClientComponent({
  options,
  fallbackLocale = DEFAULT_LOCALE,
}: LocalizedComponentProps) {
  const locale = useLocale()

  if (!options[fallbackLocale]) {
    throw new Error(`Content for fallback locale "${fallbackLocale}" is missing`)
  }

  return options[locale] ?? options[fallbackLocale]
}
