/**
 * Script to extract translations from all components of the project
 *
 * Usage:
 * npm run extract-translations
 * npm run extract-translations -- --output ./custom-output
 * npm run extract-translations -- --src ./custom-src --output ./custom-output
 */

const { spawn } = require('child_process')
const path = require('path')

const args = process.argv.slice(2)
const srcDir = getArgValue(args, '--src') || './src'
const outputDir = getArgValue(args, '--output') || './translations-extracted'

function getArgValue(args, flag) {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

console.log('🚀 Executing translation extraction...')
console.log(`📂 Source directory: ${srcDir}`)
console.log(`📁 Destination directory: ${outputDir}`)

const extractScript = path.join(__dirname, '../src/bin/extract-translations.ts')
const tsNodeProcess = spawn('npx', ['ts-node', extractScript, srcDir, outputDir], {
  stdio: 'inherit',
  shell: true,
})

tsNodeProcess.on('close', code => {
  if (code === 0) {
    console.log('\n✅ Translation extraction completed successfully!')
    console.log('\n📋 Next steps:')
    console.log(`   1. Review files in: ${outputDir}`)
    console.log('   2. Send JSON files to translation team')
  } else {
    console.error(`\n❌ Translation extraction failed with code: ${code}`)
    process.exit(code)
  }
})

tsNodeProcess.on('error', error => {
  console.error('❌ Error executing extraction:', error.message)
  process.exit(1)
})
