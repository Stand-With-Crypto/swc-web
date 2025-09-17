import { createIntl } from '@formatjs/intl'

import type { SupportedLanguage } from './types'

// Map language codes to proper locale codes for FormatJS
const languageToLocaleMap: Record<SupportedLanguage, string> = {
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
}

/**
 * Format a date with the correct locale
 */
export function formatDateForLocale(
  date: Date,
  language: SupportedLanguage,
  style: 'full' | 'short' = 'full',
): string {
  const locale = languageToLocaleMap[language] || 'en-US'
  const intl = createIntl({ locale, messages: {} })

  return style === 'full'
    ? intl.formatDate(date, { dateStyle: 'full' })
    : intl.formatDate(date, { dateStyle: 'short' })
}

/**
 * Format a time with the correct locale
 */
export function formatTimeForLocale(date: Date, language: SupportedLanguage): string {
  const locale = languageToLocaleMap[language] || 'en-US'
  const intl = createIntl({ locale, messages: {} })

  return intl.formatTime(date, { timeStyle: 'short' })
}

/**
 * Format a number with the correct locale
 */
export function formatNumberForLocale(
  number: number,
  language: SupportedLanguage,
  options?: {
    style?: 'decimal' | 'currency' | 'percent' | 'unit'
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    useGrouping?: boolean
  },
): string {
  const locale = languageToLocaleMap[language] || 'en-US'
  const intl = createIntl({ locale, messages: {} })

  return intl.formatNumber(number, options)
}

/**
 * Format a currency with the correct locale
 */
export function formatCurrencyForLocale(
  amount: number,
  language: SupportedLanguage,
  currency: string = 'USD',
): string {
  const locale = languageToLocaleMap[language] || 'en-US'
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
  language: SupportedLanguage,
): string {
  const locale = languageToLocaleMap[language] || 'en-US'
  const intl = createIntl({ locale, messages: {} })

  return intl.formatRelativeTime(value, unit)
}

/**
 * Get the locale string for a given language
 */
export function getLocaleForLanguage(language: SupportedLanguage): string {
  return languageToLocaleMap[language] || 'en-US'
}
