import { interpolate } from '@/utils/shared/i18n/interpolation'
import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

import type { I18nMessages, InterpolationContext, MessageValues } from './types'

export interface Translator {
  t: (key: string, values?: MessageValues | InterpolationContext) => string
  hasTranslation: (key: string) => boolean
  getAvailableKeys: () => string[]
  getLanguage: () => SupportedEULanguages
  getContextName: () => string
}

export function createTranslator(
  i18nMessages: I18nMessages,
  language: SupportedEULanguages,
  contextName: string = 'unknown',
): Translator {
  const messages = i18nMessages[language] || i18nMessages.en || {}

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

    getLanguage: (): SupportedEULanguages => {
      return language
    },

    getContextName: (): string => {
      return contextName
    },
  }
}
