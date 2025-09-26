#!/usr/bin/env node

// Bundle comparison script for before/after i18n changes
const fs = require('fs')
const path = require('path')

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDiff(before, after) {
  const diff = after - before
  const pct = ((diff / before) * 100).toFixed(1)
  const sign = diff > 0 ? '+' : ''
  return `${sign}${formatBytes(diff)} (${sign}${pct}%)`
}

function compareStats(baselinePath, featurePath) {
  if (!fs.existsSync(baselinePath) || !fs.existsSync(featurePath)) {
    console.error('❌ Missing bundle stats files')
    console.log(`Baseline: ${baselinePath} (${fs.existsSync(baselinePath) ? '✅' : '❌'})`)
    console.log(`Feature:  ${featurePath} (${fs.existsSync(featurePath) ? '✅' : '❌'})`)
    process.exit(1)
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  const feature = JSON.parse(fs.readFileSync(featurePath, 'utf8'))

  console.log('📊 BUNDLE SIZE COMPARISON REPORT')
  console.log('=====================================\n')

  // Total size comparison
  console.log('🎯 TOTAL BUNDLE SIZE:')
  console.log(`   Baseline: ${formatBytes(baseline.totalSize)}`)
  console.log(`   Feature:  ${formatBytes(feature.totalSize)}`)
  console.log(`   Change:   ${formatDiff(baseline.totalSize, feature.totalSize)}\n`)

  // Asset comparison
  console.log('📦 TOP ASSET CHANGES:')
  const baselineAssets = new Map(baseline.assets.map(a => [a.name, a]))

  feature.assets.slice(0, 10).forEach(asset => {
    const baseAsset = baselineAssets.get(asset.name)
    if (baseAsset) {
      const diff = formatDiff(baseAsset.size, asset.size)
      console.log(`   ${asset.name}: ${formatBytes(asset.size)} (${diff})`)
    } else {
      console.log(`   ${asset.name}: ${formatBytes(asset.size)} (NEW)`)
    }
  })

  // New files
  const newAssets = feature.assets.filter(a => !baselineAssets.has(a.name))
  if (newAssets.length > 0) {
    console.log('\n🆕 NEW FILES:')
    newAssets.forEach(asset => {
      console.log(`   ${asset.name}: ${formatBytes(asset.size)}`)
    })
  }

  // Chunks comparison
  console.log('\n🧩 CHUNK ANALYSIS:')
  console.log(`   Baseline chunks: ${baseline.chunks.length}`)
  console.log(`   Feature chunks:  ${feature.chunks.length}`)

  // Translation-specific analysis
  const i18nAssets = feature.assets.filter(
    a =>
      a.name.includes('locale') ||
      a.name.includes('i18n') ||
      a.name.includes('translation') ||
      a.name.match(/[a-z]{2}(-[A-Z]{2})?\./),
  )

  if (i18nAssets.length > 0) {
    console.log('\n🌍 TRANSLATION FILES:')
    const i18nSize = i18nAssets.reduce((sum, asset) => sum + asset.size, 0)
    console.log(`   Total i18n size: ${formatBytes(i18nSize)}`)
    i18nAssets.forEach(asset => {
      console.log(`   ${asset.name}: ${formatBytes(asset.size)}`)
    })
  }

  // Performance impact
  const impact = ((feature.totalSize - baseline.totalSize) / baseline.totalSize) * 100
  console.log('\n⚡ PERFORMANCE IMPACT:')
  if (impact > 10) {
    console.log('   🔴 SIGNIFICANT INCREASE - Review required')
  } else if (impact > 5) {
    console.log('   🟡 MODERATE INCREASE - Consider optimization')
  } else if (impact > 0) {
    console.log('   🟢 MINIMAL INCREASE - Acceptable')
  } else {
    console.log('   ✅ NO SIZE INCREASE - Excellent')
  }

  return { baseline, feature, impact }
}

// CLI usage
if (require.main === module) {
  const [, , baselineFile, featureFile] = process.argv

  if (!baselineFile || !featureFile) {
    console.error('Usage: node compare-bundles.js <baseline-stats.json> <feature-stats.json>')
    process.exit(1)
  }

  compareStats(baselineFile, featureFile)
}

module.exports = { compareStats, formatBytes, formatDiff }
