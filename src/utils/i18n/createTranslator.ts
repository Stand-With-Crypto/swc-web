import { interpolate } from './interpolation'
import type { I18nMessages, InterpolationContext, SupportedLanguage } from './types'

export interface Translator {
  t: (key: string, context?: InterpolationContext) => string
  hasTranslation: (key: string) => boolean
  getAvailableKeys: () => string[]
  getLanguage: () => SupportedLanguage
  getContextName: () => string
}

export function createTranslator(
  i18nMessages: I18nMessages,
  language: SupportedLanguage,
  contextName: string = 'unknown',
): Translator {
  const messages = i18nMessages[language] || i18nMessages.en || {}

  return {
    t: (key: string, context?: InterpolationContext): string => {
      const value = messages[key]

      if (value === undefined) {
        console.warn(
          `Missing translation for key "${key}" in context "${contextName}" for language "${language}"`,
        )
        return key
      }

      return interpolate(value, context, language)
    },

    hasTranslation: (key: string): boolean => {
      return messages[key] !== undefined
    },

    getAvailableKeys: (): string[] => {
      return Object.keys(messages)
    },

    getLanguage: (): SupportedLanguage => {
      return language
    },

    getContextName: (): string => {
      return contextName
    },
  }
}
