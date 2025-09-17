import { headers } from 'next/headers'

import { createTranslator } from '@/utils/shared/i18n/createTranslator'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { extractLanguageFromPath } from '@/utils/shared/i18n/utils'
import {
  DEFAULT_EU_LANGUAGE,
  ORDERED_SUPPORTED_EU_LANGUAGES,
  SupportedEULanguages,
  SWC_PAGE_LANGUAGE_COOKIE_NAME,
} from '@/utils/shared/supportedLocales'

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
  language?: SupportedEULanguages,
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

export async function getServerLanguage(): Promise<SupportedEULanguages> {
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
    const cookieLanguage = headersList
      .get('cookie')
      ?.match(new RegExp(`${SWC_PAGE_LANGUAGE_COOKIE_NAME}=([^;]+)`))?.[1]
    if (cookieLanguage && ORDERED_SUPPORTED_EU_LANGUAGES.includes(cookieLanguage)) {
      return cookieLanguage as SupportedEULanguages
    }

    return DEFAULT_EU_LANGUAGE
  } catch (error) {
    console.warn('Failed to determine server language:', error)
    return DEFAULT_EU_LANGUAGE
  }
}
