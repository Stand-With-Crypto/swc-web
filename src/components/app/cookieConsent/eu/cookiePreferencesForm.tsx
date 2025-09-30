import { getStaticTranslation } from '@/utils/server/i18n/getStaticTranslation'
import { CookieConsentPermissions, OptionalCookieConsentTypes } from '@/utils/shared/cookieConsent'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export const EU_DEFAULT_VALUES: CookieConsentPermissions = {
  [OptionalCookieConsentTypes.PERFORMANCE]: false,
  [OptionalCookieConsentTypes.FUNCTIONAL]: false,
  [OptionalCookieConsentTypes.TARGETING]: false,
}

const countryCode = SupportedCountryCodes.EU

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      performance: 'Performance',
      performanceHelperText:
        'These cookies help us understand how visitors interact with our website by collecting anonymous information. They provide us with insights on traffic sources, popular pages, and other site usage patterns.',
      functional: 'Functional',
      functionalHelperText:
        'These cookies allow our website to remember choices you make and provide enhanced features. They may be set by us or by third party providers whose services we have added to our pages.',
      targeting: 'Targeting & Analytics',
      targetingHelperText:
        'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertising on other sites. They do not directly store personal information, but are based on uniquely identifying your browser and internet device.',
    },
    de: {
      performance: 'Leistung',
      performanceHelperText:
        'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie anonyme Informationen sammeln. Sie geben uns Einblicke in Traffic-Quellen, beliebte Seiten und andere Website-Nutzungsmuster.',
      functional: 'Funktional',
      functionalHelperText:
        'Diese Cookies ermöglichen es unserer Website, sich an Ihre Entscheidungen zu erinnern und erweiterte Funktionen bereitzustellen. Sie können von uns oder von Drittanbietern gesetzt werden, deren Dienste wir zu unseren Seiten hinzugefügt haben.',
      targeting: 'Zielgruppenansprache & Analyse',
      targetingHelperText:
        'Diese Cookies können über unsere Website von unseren Werbepartnern gesetzt werden. Sie können von diesen Unternehmen verwendet werden, um ein Profil Ihrer Interessen zu erstellen und Ihnen relevante Werbung auf anderen Websites zu zeigen. Sie speichern nicht direkt persönliche Informationen, sondern basieren auf der eindeutigen Identifizierung Ihres Browsers und Internetgeräts.',
    },
    fr: {
      performance: 'Performance',
      performanceHelperText:
        "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web en collectant des informations anonymes. Ils nous fournissent des informations sur les sources de trafic, les pages populaires et autres modèles d'utilisation du site.",
      functional: 'Fonctionnel',
      functionalHelperText:
        'Ces cookies permettent à notre site web de se souvenir des choix que vous faites et de fournir des fonctionnalités améliorées. Ils peuvent être définis par nous ou par des fournisseurs tiers dont nous avons ajouté les services à nos pages.',
      targeting: 'Ciblage et analyse',
      targetingHelperText:
        "Ces cookies peuvent être définis sur notre site par nos partenaires publicitaires. Ils peuvent être utilisés par ces entreprises pour créer un profil de vos intérêts et vous montrer des publicités pertinentes sur d'autres sites. Ils ne stockent pas directement d'informations personnelles, mais sont basés sur l'identification unique de votre navigateur et de votre appareil internet.",
    },
  },
})

export const getEuFieldsConfig = (language: SupportedLanguages) => {
  const { t } = getStaticTranslation(i18nMessages, language, countryCode)

  return [
    {
      key: OptionalCookieConsentTypes.PERFORMANCE,
      label: t('performance'),
      helpText: t('performanceHelperText'),
    },
    {
      key: OptionalCookieConsentTypes.FUNCTIONAL,
      label: t('functional'),
      helpText: t('functionalHelperText'),
    },
    {
      key: OptionalCookieConsentTypes.TARGETING,
      label: t('targeting'),
      helpText: t('targetingHelperText'),
    },
  ]
}
