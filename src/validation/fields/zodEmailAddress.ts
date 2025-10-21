import { string } from 'zod'

import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const zodEmailAddress = string()
  .trim()
  .email('Please enter a valid email address')
  .toLowerCase()

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      invalidEmailAddress: 'Please enter a valid email address',
    },
    fr: {
      invalidEmailAddress: 'Veuillez entrer une adresse e-mail valide',
    },
    de: {
      invalidEmailAddress: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    },
  },
})

export const getZodEmailAddress = (
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
  language = SupportedLanguages.EN,
) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)
  return string().trim().email(t('invalidEmailAddress')).toLowerCase()
}
