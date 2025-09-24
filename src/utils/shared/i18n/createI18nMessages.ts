import { getSupportedLanguagesForCountry } from '@/utils/shared/i18n/getSupportedLanguagesByCountry'
import { I18nCountryMessages, I18nMessages } from '@/utils/shared/i18n/types'
import {
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

/**
 * Creates a complete internationalization (i18n) messages object by merging default messages
 * with country/language-specific messages for all supported countries and languages.
 *
 * This function iterates through all supported countries and their respective supported languages,
 * creating a hierarchical structure where default messages serve as fallbacks and are overridden
 * by more specific language messages when provided.
 *
 * @param options - Configuration object for creating i18n messages
 * @param options.defaultMessages - Optional default messages that serve as fallbacks for all languages.
 *                                  These are applied first and can be overridden by specific language messages.
 * @param options.messagesOverrides - Optional country/language-specific messages that override default messages.
 *                                   Structure: { countryCode: { language?: ComponentMessages } }
 *                                   Languages within each country are optional, allowing partial overrides.
 *
 * @returns A complete I18nMessages object structured as:
 *          { countryCode: { language: ComponentMessages } }
 *          where each language contains merged default and specific messages
 *
 * @example
 * ```typescript
 * const messages = createI18nMessages({
 *   defaultMessages: {
 *     en: { welcome: 'Welcome' }
 *   },
 *   messagesOverrides: {
 *     us: {
 *       en: { welcome: 'Welcome to the US' }
 *     },
 *     eu: {
 *       // Only override French, other languages (en, de) will use defaults
 *       fr: { welcome: 'Bienvenue aux États-Unis' }
 *     }
 *   }
 * });
 * // Result: { us: { en: { welcome: 'Welcome to the US' } }, eu: { fr: { welcome: 'Bienvenue aux États-Unis' }, en: { welcome: 'Welcome' }, de: { welcome: 'Welcome' } } }
 * ```
 */
export function createI18nMessages<
  TLanguageMessages extends Record<string, string>,
  TMessages extends Partial<Record<SupportedLanguages, TLanguageMessages>>,
  TRequired extends keyof TMessages[keyof TMessages] = never,
>({
  defaultMessages = {} as TMessages,
  messagesOverrides = {},
}: {
  defaultMessages?: TMessages
  messagesOverrides?: Partial<
    Record<
      SupportedCountryCodes,
      Partial<{
        [L in keyof TMessages]: Partial<Pick<TMessages[L], TRequired>> & Partial<TMessages[L]>
      }>
    >
  >
} = {}): I18nMessages {
  const i18nMessages: I18nMessages = {}

  for (const countryCode of ORDERED_SUPPORTED_COUNTRIES) {
    const messagesFromCountry = {} as I18nCountryMessages<typeof countryCode>

    const supportedLanguages = getSupportedLanguagesForCountry(countryCode)
    const countryMessagesOverrides = messagesOverrides[countryCode]

    for (const language of supportedLanguages) {
      const languageMessagesOverrides =
        countryMessagesOverrides?.[language as keyof typeof countryMessagesOverrides]

      messagesFromCountry[language] = {
        ...defaultMessages?.[language],
        ...languageMessagesOverrides,
      }
    }

    i18nMessages[countryCode] = messagesFromCountry
  }

  return i18nMessages
}
