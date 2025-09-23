import { ComponentMessages, I18nCountryMessages } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export interface ExtractedTranslation {
  componentName: string
  namespace: string
  filePath: string
  messages: {
    [K in SupportedLanguages]: ComponentMessages
  }
}

export interface ExtractionResult {
  translations: ExtractedTranslation[]
  summary: {
    totalComponents: number
    totalKeys: number
    languages: SupportedLanguages[]
    missingTranslations: Array<{
      component: string
      language: SupportedLanguages
      missingKeys: string[]
    }>
  }
  unified: {
    [K in SupportedLanguages]: I18nCountryMessages<SupportedCountryCodes>
  }
}
