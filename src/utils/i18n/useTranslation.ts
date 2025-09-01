'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

import { extractLanguageFromPath } from '@/utils/i18n/language-utils'

import { createTranslator } from './createTranslator'
import type { I18nMessages } from './types'

/**
 * Hook to use translations in client components
 *
 * @param i18nMessages - Object with the component translations
 * @param contextName - Component name (optional)
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
 * function MyComponent() {
 *   const { t } = useTranslation(i18nMessages)
 *
 *   return <h1>{t('welcome', { name: 'João' })}</h1>
 * }
 * ```
 */
export function useTranslation(i18nMessages: I18nMessages, contextName: string = 'unknown') {
  const pathname = usePathname()

  const language = useMemo(() => {
    const routeLanguage = pathname ? extractLanguageFromPath(pathname) : null
    if (routeLanguage) {
      return routeLanguage
    }

    return 'en'
  }, [pathname])

  const translator = useMemo(() => {
    return createTranslator(i18nMessages, language, contextName)
  }, [i18nMessages, language, contextName])

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    componentName: translator.getContextName(),
  }
}
