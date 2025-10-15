import { FooterContent } from '@/components/app/authentication/common/footerContent'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

const countryCode = SupportedCountryCodes.EU

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      text: 'By signing up, you consent to and understand that Stand With Crypto and its vendors may collect and use your Personal Information. To learn more, visit the',
    },
    fr: {
      text: 'En vous inscrivant, vous consentez et comprenez que Stand With Crypto et ses fournisseurs peuvent collecter et utiliser vos informations personnelles. Pour en savoir plus, consultez la',
    },
    de: {
      text: 'Mit Ihrer Anmeldung stimmen Sie zu und verstehen, dass Stand With Crypto und seine Anbieter Ihre persönlichen Daten erfassen und verwenden können. Um mehr zu erfahren, besuchen Sie die',
    },
  },
})

export interface EUFooterContentProps {
  language: SupportedLanguages
}

export function EUFooterContent({ language }: EUFooterContentProps) {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return (
    <FooterContent>
      {t('text')} <FooterContent.PrivacyPolicyLink countryCode={countryCode} language={language} />.
    </FooterContent>
  )
}
