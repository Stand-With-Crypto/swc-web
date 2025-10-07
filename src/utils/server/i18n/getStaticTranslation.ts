import { createTranslator } from '@/utils/shared/i18n/createTranslator'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

/**
 * Creates a simple translation object with bound methods and type-safe keys.
 *
 * Use it when you have the countryCode and language params, but the headers or cookies
 * are not accessible (e.g. static files, utils functions, etc).
 *
 * @param i18nMessages - Object with the component translations (created with createI18nMessages)
 * @param language - The language to use for translations
 * @param countryCode - The country code to use for translations
 * @returns Object translator with type-safe t() method to translate
 *
 * @example
 * ```ts
 * const messages = createI18nMessages({
 *   defaultMessages: {
 *     en: { welcome: 'Welcome' },
 *     de: { welcome: 'Willkommen' }
 *   }
 * })
 * const { t } = getStaticTranslation(messages, SupportedLanguages.EN, SupportedCountryCodes.US)
 * const welcomeText = t('welcome') // 'welcome' is type-safe
 * ```
 *
 * @example
 * ```ts
 * // In a utility function where headers aren't available
 * function generateEmailContent(language: SupportedLanguages, countryCode: SupportedCountryCodes) {
 *   const { t } = getStaticTranslation(emailMessages, language, countryCode)
 *   return t('email.subject') // Keys are type-safe
 * }
 * ```
 */
export function getStaticTranslation<T extends Record<string, string>>(
  i18nMessages: I18nMessages<T>,
  language: SupportedLanguages,
  countryCode: SupportedCountryCodes,
) {
  const translator = createTranslator<T>({
    messages: i18nMessages,
    language,
    countryCode,
  })

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    contextName: translator.getContextName(),
  }
}
