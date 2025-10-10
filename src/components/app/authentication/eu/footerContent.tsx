import { FooterContent } from '@/components/app/authentication/common/footerContent'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

const countryCode = SupportedCountryCodes.EU

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    de: {
      textBeforePrivacy:
        'Wenn Sie sich registrieren, erklären Sie sich damit einverstanden, dass Stand With Crypto und seine Verkäufer Ihre persönlichen Informationen sammeln und verwenden können. Um mehr zu erfahren, besuchen Sie unsere',
      textBetweenLinks: 'und',
    },
    en: {
      textBeforePrivacy:
        'By signing up, you consent to and understand that Stand With Crypto and its vendors may collect and use your Personal Information. To learn more, visit our',
      textBetweenLinks: 'and the',
    },
    fr: {
      textBeforePrivacy:
        'En vous inscrivant, vous consentez à ce que Stand With Crypto et ses vendeurs puissent collecter et utiliser vos informations personnelles. Pour en savoir plus, visitez notre',
      textBetweenLinks: 'et',
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
      {t('textBeforePrivacy')}{' '}
      <FooterContent.PrivacyCollectionStatementLink countryCode={countryCode} />{' '}
      {t('textBetweenLinks')} <FooterContent.PrivacyPolicyLink countryCode={countryCode} />.
    </FooterContent>
  )
}
