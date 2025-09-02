import { headers } from 'next/headers'

import { extractLanguageFromPath } from '@/utils/i18n/languageUtils'

import { createTranslator } from './createTranslator'
import type { I18nMessages, SupportedLanguage } from './types'

/**
 * Function to use translations in server components and server-side functions
 *
 * @param i18nMessages - Object with the component translations
 * @param contextName - Component name (optional)
 * @returns Object translator with t() method to translate
 *
 * @example
 * ```tsx
 * const i18nMessages = {
 *   en: { 'title': 'Server Component Title' },
 *   de: { 'title': 'Server-Komponente Titel' },
 *   fr: { 'title': 'Titre du Composant Serveur' }
 * }
 *
 * export default function ServerComponent() {
 *   const { t } = getTranslation(i18nMessages)
 *
 *   return <h1>{t('title')}</h1>
 * }
 * ```
 */
export async function getServerTranslation(
  i18nMessages: I18nMessages,
  contextName: string = 'unknown',
  language?: SupportedLanguage,
) {
  // Use provided language or fallback to auto-detection
  const finalLanguage = language || (await getServerLanguage())
  const translator = createTranslator(i18nMessages, finalLanguage, contextName)

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    contextName: translator.getContextName(),
  }
}

export async function getServerLanguage(): Promise<SupportedLanguage> {
  try {
    const headersList = await headers()

    // Try multiple header sources for pathname
    const possiblePathnames = [
      headersList.get('x-pathname'),
      headersList.get('x-invoke-path'),
      headersList.get('x-url'),
      headersList.get('referer')?.replace(/^https?:\/\/[^/]+/, ''),
    ].filter(Boolean)

    for (const pathname of possiblePathnames) {
      if (pathname) {
        const routeLanguage = extractLanguageFromPath(pathname)
        if (routeLanguage) {
          return routeLanguage
        }
      }
    }

    // Fallback to cookie if available (set by middleware)
    const cookieLanguage = headersList.get('cookie')?.match(/swc-page-language=([^;]+)/)?.[1]
    if (cookieLanguage && ['en', 'de', 'fr'].includes(cookieLanguage)) {
      return cookieLanguage as SupportedLanguage
    }

    return 'en'
  } catch (error) {
    console.warn('Failed to determine server language:', error)
    return 'en'
  }
}
