import { ComponentMessages, LanguageMessages, SupportedLanguage } from '@/utils/i18n/types'

export interface ExtractedTranslation {
  componentName: string
  namespace: string
  filePath: string
  messages: {
    [K in SupportedLanguage]: ComponentMessages
  }
}

export interface ExtractionResult {
  translations: ExtractedTranslation[]
  summary: {
    totalComponents: number
    totalKeys: number
    languages: SupportedLanguage[]
    missingTranslations: Array<{
      component: string
      language: SupportedLanguage
      missingKeys: string[]
    }>
  }
  unified: {
    [K in SupportedLanguage]: LanguageMessages
  }
}
