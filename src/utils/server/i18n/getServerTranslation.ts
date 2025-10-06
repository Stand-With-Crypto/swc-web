'server-only'

import { headers } from 'next/headers'

import { createTranslator } from '@/utils/shared/i18n/createTranslator'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { extractLanguageFromPath } from '@/utils/shared/i18n/utils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import {
  DEFAULT_EU_LANGUAGE,
  ORDERED_SUPPORTED_EU_LANGUAGES,
  SupportedLanguages,
  SWC_PAGE_LANGUAGE_COOKIE_NAME,
} from '@/utils/shared/supportedLocales'

/**
 * Function to use translations in server components and server-side functions with type-safe keys
 *
 * @param i18nMessages - Object with the component translations (created with createI18nMessages)
 * @param contextName - Component name (optional)
 * @param countryCode - Country code (optional, defaults to DEFAULT_SUPPORTED_COUNTRY_CODE)
 * @param language - Language (optional, defaults to auto-detection)
 * @returns Object translator with type-safe t() method to translate
 *
 * @example
 * ```tsx
 * const i18nMessages = createI18nMessages({
 *   defaultMessages: {
 *     en: { 'title': 'Server Component Title' },
 *     de: { 'title': 'Server-Komponente Titel' },
 *     fr: { 'title': 'Titre du Composant Serveur' }
 *   }
 * })
 *
 * export default async function ServerComponent() {
 *   const { t } = await getServerTranslation(i18nMessages)
 *
 *   return <h1>{t('title')}</h1> // 'title' is type-safe
 * }
 * ```
 */
export async function getServerTranslation<T extends Record<string, string>>(
  i18nMessages: I18nMessages<T>,
  contextName: string = 'unknown',
  countryCode: SupportedCountryCodes = DEFAULT_SUPPORTED_COUNTRY_CODE,
  language?: SupportedLanguages,
) {
  // Use provided language or fallback to auto-detection
  const finalLanguage = language || (await getServerLanguage())
  const translator = createTranslator<T>({
    messages: i18nMessages,
    language: finalLanguage,
    countryCode,
    contextName,
  })

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    contextName: translator.getContextName(),
  }
}

export async function getServerLanguage(): Promise<SupportedLanguages> {
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
      return cookieLanguage as SupportedLanguages
    }

    return DEFAULT_EU_LANGUAGE
  } catch (error) {
    console.warn('Failed to determine server language:', error)
    return DEFAULT_EU_LANGUAGE
  }
}
