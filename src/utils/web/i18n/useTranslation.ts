import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

import { extractCountryCodeFromPathname } from '@/utils/server/extractCountryCodeFromPathname'
import { createTranslator } from '@/utils/shared/i18n/createTranslator'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { extractLanguageFromPath } from '@/utils/shared/i18n/utils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { DEFAULT_EU_LANGUAGE } from '@/utils/shared/supportedLocales'

/**
 * Hook to use translations in client components with type-safe keys
 *
 * @param i18nMessages - Object with the component translations (created with createI18nMessages)
 * @param contextName - Component name (optional)
 * @returns Object translator with type-safe t() method to translate
 *
 * @example
 * ```tsx
 * const i18nMessages = createI18nMessages({
 *   defaultMessages: {
 *     en: { 'welcome': 'Welcome {name}!' },
 *     de: { 'welcome': 'Willkommen {name}!' },
 *     fr: { 'welcome': 'Bienvenue {name}!' }
 *   }
 * })
 *
 * function MyComponent() {
 *   const { t } = useTranslation(i18nMessages)
 *
 *   return <h1>{t('welcome', { name: 'João' })}</h1> // 'welcome' is type-safe
 * }
 * ```
 */
export function useTranslation<T extends Record<string, string>>(
  i18nMessages: I18nMessages<T>,
  contextName: string = 'unknown',
) {
  const pathname = usePathname()

  const language = useMemo(() => {
    const routeLanguage = pathname ? extractLanguageFromPath(pathname) : null
    if (routeLanguage) {
      return routeLanguage
    }

    return DEFAULT_EU_LANGUAGE
  }, [pathname])

  const countryCode = useMemo(() => {
    const routeCountryCode = pathname ? extractCountryCodeFromPathname(pathname) : null
    return (routeCountryCode as SupportedCountryCodes) ?? DEFAULT_SUPPORTED_COUNTRY_CODE
  }, [pathname])

  const translator = useMemo(() => {
    return createTranslator<T>({
      messages: i18nMessages,
      language,
      countryCode,
      contextName,
    })
  }, [i18nMessages, language, countryCode, contextName])

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    componentName: translator.getContextName(),
  }
}
