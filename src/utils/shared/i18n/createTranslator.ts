import { interpolate } from '@/utils/shared/i18n/interpolation'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import type { I18nMessages, InterpolationContext, MessageValues } from './types'

export interface Translator<T extends Record<string, string> = Record<string, string>> {
  t: (key: keyof T, values?: MessageValues | InterpolationContext) => string
  hasTranslation: (key: keyof T) => boolean
  getAvailableKeys: () => (keyof T)[]
  getLanguage: () => SupportedLanguages
  getContextName: () => string
}

/**
 * Creates a translator object with type-safe translation keys.
 * Based on the getX pattern from a.ts.
 *
 * @param i18nMessages - The complete i18n messages object
 * @param language - The language to use for translations
 * @param countryCode - The country code to use for translations
 * @param contextName - Optional context name for debugging
 * @returns A translator object with type-safe t() method
 */
export function createTranslator<T extends Record<string, string>>({
  messages,
  language,
  countryCode,
  contextName = 'unknown',
}: {
  messages: I18nMessages<T>
  language: SupportedLanguages
  countryCode: SupportedCountryCodes
  contextName?: string
}): Translator<T> {
  const countryMessages = messages[countryCode] ?? {}
  const languageMessages = (countryMessages[language] ?? {}) as T

  return {
    t: (key: keyof T, values?: MessageValues | InterpolationContext): string => {
      const value = languageMessages[key]

      if (value === undefined) {
        console.warn(
          `Missing translation for key "${String(key)}" in context "${contextName}" for language "${language}"`,
        )
        return String(key)
      }

      return interpolate(value, values, language)
    },

    hasTranslation: (key: keyof T): boolean => {
      return languageMessages[key] !== undefined
    },

    getAvailableKeys: (): (keyof T)[] => {
      return Object.keys(languageMessages) as (keyof T)[]
    },

    getLanguage: (): SupportedLanguages => {
      return language
    },

    getContextName: (): string => {
      return contextName
    },
  }
}
