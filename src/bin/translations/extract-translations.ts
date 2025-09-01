import * as fs from 'fs'
import * as path from 'path'
import type { SupportedLanguage } from 'src/utils/i18n/types'

import { runBin } from '@/bin/runBin'
import { ExtractedTranslation, ExtractionResult } from '@/bin/translations/types'
import {
  analyzeMissingTranslations,
  extractTranslationsFromFile,
  findTranslationFiles,
  generateMarkdownReport,
  unifyTranslations,
} from '@/bin/translations/utils'

function extractTranslations(srcDir: string): ExtractionResult {
  console.log(`🔍 Looking for translation files in: ${srcDir}`)

  const files = findTranslationFiles(srcDir)
  console.log(`📁 Found ${files.length} files to analyze`)

  const translations: ExtractedTranslation[] = []

  for (const file of files) {
    const extracted = extractTranslationsFromFile(file)
    if (extracted) {
      translations.push(extracted)
    }
  }

  console.log(`✅ Extracted translations from ${translations.length} components`)

  const missingTranslations = analyzeMissingTranslations(translations)

  const unified = unifyTranslations(translations)

  const totalKeys = translations.reduce((acc, t) => {
    const keys = new Set<string>()
    Object.values(t.messages).forEach(msgs => {
      Object.keys(msgs).forEach(key => keys.add(key))
    })
    return acc + keys.size
  }, 0)

  return {
    translations,
    summary: {
      totalComponents: translations.length,
      totalKeys,
      languages: ['en', 'de', 'fr'],
      missingTranslations,
    },
    unified,
  }
}

function saveExtractionResults(result: ExtractionResult, outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Save unified translations by language
  for (const locale of Object.keys(result.unified) as SupportedLanguage[]) {
    const outputPath = path.join(outputDir, `${locale}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(result.unified[locale], null, 2), 'utf-8')
    console.log(`💾 Saved: ${outputPath}`)
  }

  const reportPath = path.join(outputDir, 'extraction-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`📊 Saved report: ${reportPath}`)

  const markdownPath = path.join(outputDir, 'translation-report.md')
  const markdownContent = generateMarkdownReport(result)
  fs.writeFileSync(markdownPath, markdownContent, 'utf-8')
  console.log(`📝 Saved markdown report: ${markdownPath}`)
}

async function generateTranslationsReport() {
  const args = process.argv.slice(2)
  const srcDir = args[0] || './src'
  const outputDir = args[1] || './translations-extracted'

  console.log(`🚀 Starting translation extraction...`)
  console.log(`📂 Source directory: ${path.resolve(srcDir)}`)
  console.log(`📁 Destination directory: ${path.resolve(outputDir)}`)

  try {
    const result = extractTranslations(srcDir)
    saveExtractionResults(result, outputDir)

    console.log(`\n✨ Translation extraction completed successfully!`)
    console.log(`📊 Summary:`)
    console.log(`   - ${result.summary.totalComponents} components`)
    console.log(`   - ${result.summary.totalKeys} translation keys`)
    console.log(`   - ${result.summary.missingTranslations.length} missing translations`)

    if (result.summary.missingTranslations.length > 0) {
      console.log(`\n⚠️  Attention: There are missing translations. Check the report.`)
    }
  } catch (error) {
    console.error(`❌ Error during extraction:`, error)
    process.exit(1)
  }
}

void runBin(generateTranslationsReport)

export { extractTranslations, generateMarkdownReport, saveExtractionResults }
