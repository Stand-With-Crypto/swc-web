import { createTranslator } from '@/utils/shared/i18n/createTranslator'
import { I18nMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

/**
 * Creates a simple translation object with bound methods.
 *
 * Use it when you have the countryCode and language params, but the headers or cookies
 * are not accessible (e.g. static files, utils functions, etc).
 *
 * @example
 * ```ts
 * const { t } = getSimpleTranslation(messages, 'en', 'US')
 * const welcomeText = t('welcome')
 * ```
 *
 * @example
 * ```ts
 * // In a utility function where headers aren't available
 * function generateEmailContent(language: SupportedLanguages, countryCode: SupportedCountryCodes) {
 *   const { t } = getSimpleTranslation(emailMessages, language, countryCode)
 *   return t('email.subject')
 * }
 * ```
 */
export function getSimpleTranslation(
  i18nMessages: I18nMessages,
  language: SupportedLanguages,
  countryCode: SupportedCountryCodes,
) {
  const translator = createTranslator(i18nMessages, language, countryCode)

  return {
    t: translator.t.bind(translator),
    hasTranslation: translator.hasTranslation.bind(translator),
    getAvailableKeys: translator.getAvailableKeys.bind(translator),
    language: translator.getLanguage(),
    contextName: translator.getContextName(),
  }
}
