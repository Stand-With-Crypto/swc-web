import { CookiePreferencesFieldConfig } from '@/components/app/cookieConsent/common/cookiePreferencesForm'
import { CookieConsentPermissions, OptionalCookieConsentTypes } from '@/utils/shared/cookieConsent'

export const GB_DEFAULT_VALUES: CookieConsentPermissions = {
  [OptionalCookieConsentTypes.PERFORMANCE]: false,
  [OptionalCookieConsentTypes.FUNCTIONAL]: false,
  [OptionalCookieConsentTypes.TARGETING]: false,
}

export const GB_FIELDS_CONFIG: CookiePreferencesFieldConfig[] = [
  {
    key: OptionalCookieConsentTypes.PERFORMANCE,
    label: 'Performance',
    helpText:
      'These cookies help us understand how visitors interact with our website by collecting anonymous information. They provide us with insights on traffic sources, popular pages, and other site usage patterns.',
  },
  {
    key: OptionalCookieConsentTypes.FUNCTIONAL,
    label: 'Functional',
    helpText:
      'These cookies allow our website to remember choices you make and provide enhanced features. They may be set by us or by third party providers whose services we have added to our pages.',
  },
  {
    key: OptionalCookieConsentTypes.TARGETING,
    label: 'Targeting & Analytics',
    helpText:
      'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertising on other sites. They do not directly store personal information, but are based on uniquely identifying your browser and internet device.',
  },
]
