import { interpolate } from '@/utils/shared/i18n/interpolation'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

import type {
  I18nCountryMessages,
  I18nMessages,
  InterpolationContext,
  MessageValues,
} from './types'

export interface Translator {
  t: (key: string, values?: MessageValues | InterpolationContext) => string
  hasTranslation: (key: string) => boolean
  getAvailableKeys: () => string[]
  getLanguage: () => SupportedLanguages
  getContextName: () => string
}

export function createTranslator<T extends SupportedCountryCodes>(
  i18nMessages: I18nMessages,
  language: SupportedLanguages,
  countryCode: T,
  contextName: string = 'unknown',
): Translator {
  const countryMessages =
    countryCode in i18nMessages ? (i18nMessages[countryCode] as I18nCountryMessages<T>) : {}
  const messages =
    (language in countryMessages
      ? countryMessages[language as keyof typeof countryMessages]
      : i18nMessages.us?.en) || {}

  return {
    t: (key: string, values?: MessageValues | InterpolationContext): string => {
      const value = messages[key]

      if (value === undefined) {
        console.warn(
          `Missing translation for key "${key}" in context "${contextName}" for language "${language}"`,
        )
        return key
      }

      return interpolate(value, values, language)
    },

    hasTranslation: (key: string): boolean => {
      return messages[key] !== undefined
    },

    getAvailableKeys: (): string[] => {
      return Object.keys(messages)
    },

    getLanguage: (): SupportedLanguages => {
      return language
    },

    getContextName: (): string => {
      return contextName
    },
  }
}
