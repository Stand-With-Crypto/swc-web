import { InternalLink } from '@/components/ui/link'
import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      privacyCollectionStatement: 'Privacy Collection Statement',
      privacyPolicy: 'Stand With Crypto Privacy Policy',
    },
    fr: {
      privacyCollectionStatement: 'Déclaration de collecte de confidentialité',
      privacyPolicy: 'Politique de confidentialité de Stand With Crypto',
    },
    de: {
      privacyCollectionStatement: 'Datenschutz-Erklärung zur Datenerhebung',
      privacyPolicy: 'Datenschutzrichtlinie von Stand With Crypto',
    },
  },
})

export function FooterContent({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="text-[10px]">{children}</span>
    </p>
  )
}

FooterContent.PrivacyPolicyLink = function PrivacyPolicyLink({
  countryCode,
  language = SupportedLanguages.EN,
}: {
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) {
  const urls = getIntlUrls(countryCode, { language })
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)
  return (
    <InternalLink href={urls.privacyPolicy()} target="_blank">
      {t('privacyPolicy')}
    </InternalLink>
  )
}

FooterContent.PrivacyCollectionStatementLink = function PrivacyCollectionStatementLink({
  countryCode,
  language = SupportedLanguages.EN,
}: {
  countryCode: SupportedCountryCodes
  language?: SupportedLanguages
}) {
  const urls = getIntlUrls(countryCode, { language })

  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return (
    <InternalLink href={urls.privacyCollectionStatement()} target="_blank">
      {t('privacyCollectionStatement')}
    </InternalLink>
  )
}
