import { ComponentMessages, LanguageMessages } from '@/utils/shared/i18n/types'
import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

export interface ExtractedTranslation {
  componentName: string
  namespace: string
  filePath: string
  messages: {
    [K in SupportedEULanguages]: ComponentMessages
  }
}

export interface ExtractionResult {
  translations: ExtractedTranslation[]
  summary: {
    totalComponents: number
    totalKeys: number
    languages: SupportedEULanguages[]
    missingTranslations: Array<{
      component: string
      language: SupportedEULanguages
      missingKeys: string[]
    }>
  }
  unified: {
    [K in SupportedEULanguages]: LanguageMessages
  }
}
