import { createIntl } from '@formatjs/intl'

import {
  DEFAULT_EU_LANGUAGE,
  LANGUAGE_TO_LOCALE_MAP,
  SupportedLanguages,
} from '@/utils/shared/supportedLocales'

/**
 * Format a date with the correct locale
 */
export function formatDateForLocale(
  date: Date,
  language: SupportedLanguages,
  style: 'full' | 'short' = 'full',
): string {
  const locale = LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
  const intl = createIntl({ locale, messages: {} })

  return style === 'full'
    ? intl.formatDate(date, { dateStyle: 'full' })
    : intl.formatDate(date, { dateStyle: 'short' })
}

/**
 * Format a time with the correct locale
 */
export function formatTimeForLocale(date: Date, language: SupportedLanguages): string {
  const locale = LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
  const intl = createIntl({ locale, messages: {} })

  return intl.formatTime(date, { timeStyle: 'short' })
}

/**
 * Format a number with the correct locale
 */
export function formatNumberForLocale(
  number: number,
  language: SupportedLanguages,
  options?: {
    style?: 'decimal' | 'currency' | 'percent' | 'unit'
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    useGrouping?: boolean
  },
): string {
  const locale = LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
  const intl = createIntl({ locale, messages: {} })

  return intl.formatNumber(number, options)
}

/**
 * Format a currency with the correct locale
 */
export function formatCurrencyForLocale(
  amount: number,
  language: SupportedLanguages,
  currency: string = 'USD',
): string {
  const locale = LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
  const intl = createIntl({ locale, messages: {} })

  return intl.formatNumber(amount, {
    style: 'currency',
    currency,
  })
}

/**
 * Format a relative time with the correct locale
 */
export function formatRelativeTimeForLocale(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  language: SupportedLanguages,
): string {
  const locale = LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
  const intl = createIntl({ locale, messages: {} })

  return intl.formatRelativeTime(value, unit)
}

/**
 * Get the locale string for a given language
 */
export function getLocaleForLanguage(language: SupportedLanguages): string {
  return LANGUAGE_TO_LOCALE_MAP[language] || LANGUAGE_TO_LOCALE_MAP[DEFAULT_EU_LANGUAGE]
}
