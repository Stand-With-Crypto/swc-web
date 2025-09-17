import { createIntl, createIntlCache, IntlShape } from '@formatjs/intl'

import type {
  InterpolationContext,
  MessageValues,
  SupportedLanguage,
  TranslationMessage,
} from './types'

// Create a global cache for performance
const intlCache = createIntlCache()

// Map language codes to proper locale codes for FormatJS
const languageToLocaleMap: Record<SupportedLanguage, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
}

// Store intl instances per locale - clear cache to force recreation with new locales
const intlInstances: Map<SupportedLanguage, IntlShape> = new Map()

/**
 * Get or create an IntlShape instance for the given language
 */
function getIntlInstance(language: SupportedLanguage): IntlShape {
  // Always recreate to ensure we use the correct locale
  const locale = languageToLocaleMap[language] || 'en-US'
  const intl = createIntl(
    {
      locale,
      messages: {}, // We'll pass messages directly to formatMessage
      defaultLocale: 'en-US',
      // Suppress missing translation warnings since we're using dynamic messages
      onError: (err) => {
        // Only log non-missing-translation errors
        if (!err.message.includes('MISSING_TRANSLATION')) {
          console.error('FormatJS error:', err)
        }
      },
    },
    intlCache,
  )

  // Cache the instance for this language
  intlInstances.set(language, intl)
  return intl
}

/**
 * Format a message using FormatJS intl
 */
export function interpolate(
  value: TranslationMessage,
  context: InterpolationContext | MessageValues = {},
  language: SupportedLanguage = 'en',
): string {
  const intl = getIntlInstance(language)

  try {
    // Handle ICU message format strings (value is always a string now)
    const formattedContext: Record<string, any> = {}
    Object.keys(context).forEach(key => {
      formattedContext[key] = (context as any)[key]
    })

    const result = intl.formatMessage(
      {
        id: 'dynamic_message',
        description: 'Dynamic message for interpolation',
        defaultMessage: value,
      },
      formattedContext,
    )

    return Array.isArray(result) ? result.join('') : result
  } catch (error) {
    console.error('FormatJS interpolation error:', error, { value, context, language })
    // Fallback to the raw string
    return value
  }
}



// Export utility functions from FormatJS for direct use
export type { IntlShape } from '@formatjs/intl'
export { createIntl, createIntlCache } from '@formatjs/intl'