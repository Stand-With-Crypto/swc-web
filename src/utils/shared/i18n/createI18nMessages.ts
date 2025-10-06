import { getSupportedLanguagesForCountry } from '@/utils/shared/i18n/getSupportedLanguagesByCountry'
import {
  I18nMessages,
  SupportedLanguagesByCountryCode,
  UniformShape,
} from '@/utils/shared/i18n/types'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

/**
 * Creates a complete internationalization (i18n) messages object by merging default messages
 * with country/language-specific messages for all supported countries and languages.
 *
 * This function uses type-safe keys to ensure that all translation keys are valid across
 * all languages. The defaultMessages parameter enforces that all language objects have
 * identical keys through the UniformShape type.
 *
 * @param options - Configuration object for creating i18n messages
 * @param options.defaultMessages - Default messages that serve as fallbacks for all languages.
 *                                  All language objects must have the same keys.
 * @param options.overrides - Optional country/language-specific messages that override default messages.
 *                           Can only override keys that exist in defaultMessages.
 *
 * @returns A complete I18nMessages object structured as:
 *          { countryCode: { language: Messages } }
 *          where each language contains merged default and override messages
 *
 * @example
 * ```typescript
 * const messages = createI18nMessages({
 *   defaultMessages: {
 *     en: { welcome: 'Welcome', test: 'Test' },
 *     de: { welcome: 'Willkommen', test: 'Test' },
 *     fr: { welcome: 'Bienvenue', test: 'Test' }
 *   },
 *   overrides: {
 *     us: {
 *       en: { welcome: 'Welcome to the US' } // Can only override 'welcome' or 'test'
 *     }
 *   }
 * });
 * ```
 */
export function createI18nMessages<
  const TDefaultMessages extends Partial<Record<SupportedLanguages, Record<string, string>>>,
  T extends Record<string, string> = NonNullable<TDefaultMessages[keyof TDefaultMessages]>,
>({
  defaultMessages,
  messagesOverrides,
}: {
  defaultMessages: TDefaultMessages & UniformShape<TDefaultMessages>
  messagesOverrides?: Partial<{
    [Country in SupportedCountryCodes]?: Partial<{
      [Lang in SupportedLanguagesByCountryCode[Country][number]]?: T extends infer U
        ? Partial<Record<keyof U, string>>
        : unknown
    }>
  }>
}): I18nMessages<T> {
  const i18nMessages: I18nMessages<T> = {}

  for (const countryCode of ORDERED_SUPPORTED_COUNTRIES) {
    const supportedLanguages = getSupportedLanguagesForCountry(countryCode)
    const countryMessagesOverrides = messagesOverrides?.[countryCode]
    const countryMessages: Record<string, Record<string, string>> = {}

    for (const language of supportedLanguages) {
      const languageMessagesOverrides =
        countryMessagesOverrides?.[language as keyof typeof countryMessagesOverrides]

      const baseMessages = defaultMessages[language] ?? {}
      const overrideMessages = languageMessagesOverrides ?? {}

      countryMessages[language] = {
        ...baseMessages,
        ...overrideMessages,
      }
    }

    i18nMessages[countryCode] = countryMessages
  }

  return i18nMessages
}
