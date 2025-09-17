import * as fs from 'fs'
import * as path from 'path'

import { runBin } from '@/bin/runBin'
import { analyzeMissingTranslations, findTranslationFiles } from '@/bin/translations/utils'

async function generateTranslationsReport() {
  const outputDir = path.join(__dirname, 'translations-extracted')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('🚀 Starting translation extraction...')
  console.log(`📁 Output directory: ${outputDir}`)

  const extractedFiles: Array<{
    filePath: string
    componentName: string
    translations: {
      en: Record<string, any>
      de: Record<string, any>
      fr: Record<string, any>
    }
  }> = []

  // Scan all files to find i18nMessages exports
  const allFiles = findTranslationFiles('./src')

  for (const filePath of allFiles) {
    try {
      // Skip files in the bin/translations directory to avoid importing the script itself
      if (filePath.includes('bin/translations')) {
        continue
      }

      const content = fs.readFileSync(filePath, 'utf-8')

      // Check if file actually contains i18nMessages export
      if (!content.includes('export const i18nMessages')) {
        continue
      }

      console.log(`🔍 Found i18nMessages export in: ${filePath}`)

      const relativePath = path.relative('src', filePath)
      const componentName = relativePath.replace(/\.(ts|tsx)$/, '')

      try {
        // Convert to absolute path and use dynamic import
        const absolutePath = path.resolve(filePath)

        // Clear require cache to ensure fresh import
        delete require.cache[absolutePath]
        // Use dynamic import to load the module
        const importedModule = await import(`file://${absolutePath}?t=${Date.now()}`)

        if (importedModule.i18nMessages) {
          extractedFiles.push({
            filePath: relativePath,
            componentName,
            translations: importedModule.i18nMessages,
          })
          console.log(`✅ Successfully imported ${componentName} translations`)
        } else {
          console.log(`⚠️  Module loaded but no i18nMessages found: ${filePath}`)
        }
      } catch (importError: unknown) {
        const errorMsg = importError instanceof Error ? importError.message : String(importError)
        console.log(`⚠️  Could not import ${filePath}: ${errorMsg}`)
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.log(`❌ Error processing ${filePath}: ${errorMsg}`)
    }
  }

  // Create organized output by file
  const organized = {
    en: {} as Record<string, any>,
    de: {} as Record<string, any>,
    fr: {} as Record<string, any>,
  }

  for (const file of extractedFiles) {
    for (const [lang, translations] of Object.entries(file.translations)) {
      if (lang === 'en' || lang === 'de' || lang === 'fr') {
        organized[lang as keyof typeof organized][file.componentName] = translations
      }
    }
  }

  // Save files
  for (const [lang, content] of Object.entries(organized)) {
    const filePath = path.join(outputDir, `${lang}.json`)
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')
    console.log(`💾 Saved: ${filePath}`)
  }

  // Analyze for missing translations
  const missingTranslations = analyzeMissingTranslations(extractedFiles)

  // Create summary report
  const summary = {
    extractedFiles: extractedFiles.length,
    totalKeys: extractedFiles.reduce((acc, file) => {
      const keys = new Set()
      Object.values(file.translations).forEach(lang => {
        Object.keys(lang).forEach(key => keys.add(key))
      })
      return acc + keys.size
    }, 0),
    missingTranslations,
    files: extractedFiles.map(f => ({
      file: f.filePath,
      component: f.componentName,
      languages: Object.keys(f.translations),
      keyCount: Object.keys(f.translations.en || {}).length,
    })),
  }

  const reportPath = path.join(outputDir, 'extraction-summary.json')
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`📊 Saved summary: ${reportPath}`)

  console.log(`\n✨ Extraction completed!`)
  console.log(`📊 Summary:`)
  console.log(`   - ${summary.extractedFiles} files processed`)
  console.log(`   - ${summary.totalKeys} translation keys`)
  console.log(`   - ${summary.missingTranslations.length} missing translations`)
  console.log(`   - Output: ${outputDir}`)

  if (summary.missingTranslations.length > 0) {
    console.log(`\n⚠️  Missing translations found:`)
    for (const missing of summary.missingTranslations) {
      console.log(
        `   - ${missing.component} (${missing.language}): ${missing.missingKeys.join(', ')}`,
      )
    }
  }
}

void runBin(generateTranslationsReport)