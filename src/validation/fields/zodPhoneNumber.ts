import { literal, string, union } from 'zod'

import { normalizePhoneNumber, validatePhoneNumber } from '@/utils/shared/phoneNumber'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      invalidPhoneNumber: 'Please enter a valid phone number',
    },
    fr: {
      invalidPhoneNumber: 'Veuillez entrer un numéro de téléphone valide',
    },
    de: {
      invalidPhoneNumber: 'Bitte geben Sie eine gültige Telefonnummer ein',
    },
  },
})

export function zodPhoneNumber(
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
  language = SupportedLanguages.EN,
) {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return string()
    .refine(phoneNumber => validatePhoneNumber(phoneNumber, countryCode), t('invalidPhoneNumber'))
    .transform(phoneNumber => normalizePhoneNumber(phoneNumber, countryCode))
}

export const zodOptionalEmptyPhoneNumber = (
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
  language = SupportedLanguages.EN,
) => union([zodPhoneNumber(countryCode, language), literal('')])
