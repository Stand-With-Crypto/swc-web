import * as glob from 'glob'

import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

/**
 * Find all files with translations
 */
export function findTranslationFiles(srcDir: string): string[] {
  const patterns = [`${srcDir}/**/*.tsx`, `${srcDir}/**/*.ts`]

  const files: string[] = []

  for (const pattern of patterns) {
    const matches = glob.sync(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/bin/**', // Exclude script files
      ],
    })
    files.push(...matches)
  }

  return [...new Set(files)]
}

/**
 * Analyze translations to find missing keys
 */
export function analyzeMissingTranslations(
  extractedFiles: Array<{
    componentName: string
    translations: Record<string, any>
  }>,
): Array<{
  component: string
  language: SupportedEULanguages
  missingKeys: string[]
}> {
  const missingTranslations: Array<{
    component: string
    language: SupportedEULanguages
    missingKeys: string[]
  }> = []

  const languages: SupportedEULanguages[] = [
    SupportedEULanguages.EN,
    SupportedEULanguages.DE,
    SupportedEULanguages.FR,
  ]

  for (const file of extractedFiles) {
    // Get all keys from all languages
    const allKeys = new Set<string>()
    for (const language of languages) {
      if (file.translations[language]) {
        Object.keys(file.translations[language]).forEach(key => allKeys.add(key))
      }
    }

    // Check for missing keys in each language
    for (const language of languages) {
      const localeMessages = file.translations[language] || {}
      const existingKeys = new Set(Object.keys(localeMessages))
      const missingKeys = Array.from(allKeys).filter(key => !existingKeys.has(key))

      if (missingKeys.length > 0) {
        missingTranslations.push({
          component: file.componentName,
          language,
          missingKeys,
        })
      }
    }
  }

  return missingTranslations
}
