/* eslint-disable formatjs/enforce-default-message */
import { createIntl, createIntlCache, IntlShape } from '@formatjs/intl'

import {
  DEFAULT_EU_LANGUAGE,
  LANGUAGE_TO_LOCALE_MAP,
  SupportedLanguages,
} from '@/utils/shared/supportedLocales'

import type { InterpolationContext, MessageValues } from './types'

const intlCache = createIntlCache()
const intlInstances: Map<SupportedLanguages, IntlShape> = new Map()

function getIntlInstance(language: SupportedLanguages): IntlShape {
  const locale = LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
  const intl = createIntl(
    {
      locale,
      messages: {}, // We'll pass messages directly to formatMessage
      defaultLocale: LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE],
      // Suppress missing translation warnings since we're using dynamic messages
      onError: err => {
        // Only log non-missing-translation errors
        if (!err.message.includes('MISSING_TRANSLATION')) {
          console.error('FormatJS error:', err)
        }
      },
    },
    intlCache,
  )

  intlInstances.set(language, intl)
  return intl
}

/**
 * Format a message using FormatJS intl
 */
export function interpolate(
  value: string,
  context: InterpolationContext | MessageValues = {},
  language: SupportedLanguages = DEFAULT_EU_LANGUAGE,
): string {
  const intl = getIntlInstance(language)

  try {
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
