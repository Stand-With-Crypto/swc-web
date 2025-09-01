'use client'

import { useMemo } from 'react'

import { createTranslator } from './createTranslator'
import type { I18nMessages, SupportedLanguage } from './types'

/**
 * Hook to use translations in client components
 *
 * @param i18nMessages - Object with the component translations
 * @param language - Current language
 * @param componentName - Component name (optional, will be inferred automatically)
 * @returns Object translator with t() method to translate
 *
 * @example
 * ```tsx
 * const i18nMessages = {
 *   en: { 'welcome': 'Welcome {name}!' },
 *   de: { 'welcome': 'Willkommen {name}!' },
 *   fr: { 'welcome': 'Bienvenue {name}!' }
 * }
 *
 * function MyComponent({ language }: { language: SupportedLanguage }) {
 *   const { t } = useTranslation(i18nMessages, language)
 *
 *   return <h1>{t('welcome', { name: 'João' })}</h1>
 * }
 * ```
 */
export function useTranslation(
  i18nMessages: I18nMessages,
  locale: SupportedLanguage,
  contextName: string = 'unknown',
) {
  const translator = useMemo(() => {
    return createTranslator(i18nMessages, locale, contextName)
  }, [i18nMessages, locale, contextName])

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    componentName: translator.getContextName(),
  }
}
