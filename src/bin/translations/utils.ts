import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'

import { ExtractedTranslation, ExtractionResult } from '@/bin/translations/types'
import { ComponentMessages, LanguageMessages, SupportedLanguage } from '@/utils/i18n/types'

/**
 * Extract translations from a TypeScript/TSX file
 */
export function extractTranslationsFromFile(filePath: string): ExtractedTranslation | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Regex to find i18nMessages definitions
    const i18nRegex = /const\s+i18nMessages\s*=\s*({[\s\S]*?})\s*(?=\n|$|;)/g
    const match = i18nRegex.exec(content)

    if (!match) {
      return null
    }

    const messagesString = match[1]

    try {
      // Remove comments and format for valid JSON
      const cleanedString = messagesString
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to keys
        .replace(/'/g, '"') // Convert single quotes to double quotes

      const parsed = eval(`(${cleanedString})`)

      const componentName = path.basename(filePath, path.extname(filePath))
      const namespace = generateNamespaceFromPath(filePath)

      return {
        componentName,
        namespace,
        filePath,
        messages: parsed as { [K in SupportedLanguage]: ComponentMessages },
      }
    } catch (parseError) {
      console.warn(`Error parsing ${filePath}:`, parseError)
      return null
    }
  } catch (error) {
    console.warn(`Error reading file ${filePath}:`, error)
    return null
  }
}

/**
 * Find all files with translations
 */
export function findTranslationFiles(srcDir: string): string[] {
  const patterns = [`${srcDir}/**/*.tsx`, `${srcDir}/**/*.ts`]

  const files: string[] = []

  for (const pattern of patterns) {
    const matches = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.*', '**/*.spec.*'],
    })
    files.push(...matches)
  }

  return [...new Set(files)]
}

/**
 * Analyze translations to find missing keys
 */
export function analyzeMissingTranslations(translations: ExtractedTranslation[]): Array<{
  component: string
  language: SupportedLanguage
  missingKeys: string[]
}> {
  const missingTranslations: Array<{
    component: string
    language: SupportedLanguage
    missingKeys: string[]
  }> = []

  const languages: SupportedLanguage[] = ['en', 'de', 'fr']

  for (const translation of translations) {
    // Get all keys from all languages
    const allKeys = new Set<string>()
    for (const language of languages) {
      if (translation.messages[language]) {
        Object.keys(translation.messages[language]).forEach(key => allKeys.add(key))
      }
    }

    // Check for missing keys in each language
    for (const language of languages) {
      const localeMessages = translation.messages[language] || {}
      const existingKeys = new Set(Object.keys(localeMessages))
      const missingKeys = Array.from(allKeys).filter(key => !existingKeys.has(key))

      if (missingKeys.length > 0) {
        missingTranslations.push({
          component: translation.componentName,
          language,
          missingKeys,
        })
      }
    }
  }

  return missingTranslations
}

/**
 * Unify all translations into an object by language
 */
export function unifyTranslations(translations: ExtractedTranslation[]): {
  [K in SupportedLanguage]: LanguageMessages
} {
  const unified: { [K in SupportedLanguage]: LanguageMessages } = {
    en: {},
    de: {},
    fr: {},
  }

  for (const translation of translations) {
    for (const locale of Object.keys(translation.messages) as SupportedLanguage[]) {
      // Use namespace instead of componentName to avoid conflicts
      if (!unified[locale][translation.namespace]) {
        unified[locale][translation.namespace] = {}
      }

      unified[locale][translation.namespace] = {
        ...unified[locale][translation.namespace],
        ...translation.messages[locale],
      }
    }
  }

  return unified
}

/**
 * Generate namespace based on file path
 * Example: src/components/auth/LoginForm.tsx -> components.auth.LoginForm
 */
export function generateNamespaceFromPath(filePath: string): string {
  // Remove extension and src/ directory
  const cleanPath = filePath.replace(/\.(tsx?|jsx?)$/, '').replace(/^.*\/src\//, '')

  // Convert path to namespace with dots
  const namespace = cleanPath
    .split('/')
    .filter(part => part !== 'index') // Remove index files
    .map(part => {
      // Convert kebab-case and snake_case to camelCase
      return part.replace(/[-_](.)/g, (_, letter) => letter.toUpperCase())
    })
    .join('.')

  return namespace
}

/**
 * Generate markdown report
 */
export function generateMarkdownReport(result: ExtractionResult): string {
  const { summary, translations } = result

  let markdown = `# Translation Extraction Report\n\n`
  markdown += `**Generated at:** ${new Date().toISOString()}\n\n`

  markdown += `## Summary\n\n`
  markdown += `- **Total Components:** ${summary.totalComponents}\n`
  markdown += `- **Total Translation Keys:** ${summary.totalKeys}\n`
  markdown += `- **Supported Locales:** ${summary.languages.join(', ')}\n`
  markdown += `- **Missing Translations:** ${summary.missingTranslations.length}\n\n`

  if (summary.missingTranslations.length > 0) {
    markdown += `## Missing Translations ⚠️\n\n`

    for (const missing of summary.missingTranslations) {
      markdown += `### ${missing.component} (${missing.language})\n\n`
      markdown += `Missing keys:\n`
      for (const key of missing.missingKeys) {
        markdown += `- \`${key}\`\n`
      }
      markdown += `\n`
    }
  }

  markdown += `## Components with Translations\n\n`

  for (const translation of translations) {
    markdown += `### ${translation.componentName}\n\n`
    markdown += `**File:** \`${translation.filePath}\`\n\n`

    const locales = Object.keys(translation.messages) as SupportedLanguage[]
    markdown += `**Available locales:** ${locales.join(', ')}\n\n`

    const keys = new Set<string>()
    Object.values(translation.messages).forEach(msgs => {
      Object.keys(msgs).forEach(key => keys.add(key))
    })

    markdown += `**Translation keys (${keys.size}):**\n`
    for (const key of Array.from(keys).sort()) {
      markdown += `- \`${key}\`\n`
    }
    markdown += `\n`
  }

  return markdown
}
