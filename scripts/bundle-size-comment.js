#!/usr/bin/env node

/**
 * Comprehensive Bundle Size PR Comment Generator
 * Analyzes all aspects of bundle changes: size, dependencies, performance, etc.
 */

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
  const pct = before > 0 ? ((diff / before) * 100).toFixed(1) : '∞'
  const sign = diff > 0 ? '+' : ''

  if (Math.abs(diff) < 100) return '~0 B (0%)' // Negligible change

  return `${sign}${formatBytes(diff)} (${sign}${pct}%)`
}

function getChangeIcon(before, after) {
  const diff = after - before
  const pct = before > 0 ? (diff / before) * 100 : 0

  if (Math.abs(pct) < 1) return '⚪' // No significant change
  if (pct > 15) return '🔴' // Critical increase
  if (pct > 10) return '🟡' // Significant increase
  if (pct > 5) return '🟠' // Moderate increase
  if (pct > 0) return '🟢' // Minor increase
  return '✅' // Decrease
}

function parseNextJsBuildOutput(filepath) {
  if (!fs.existsSync(filepath)) return []

  const content = fs.readFileSync(filepath, 'utf8')
  const routes = []

  // Parse Next.js build output for route sizes
  const lines = content.split('\n')
  lines.forEach(line => {
    const routeMatch = line.match(
      /[├└]\s+[○●λ]\s+([^\s]+)\s+([0-9.]+\s+[A-Z]+)\s+([0-9.]+\s+[A-Z]+)/,
    )
    if (routeMatch) {
      const [, route, size, firstLoad] = routeMatch
      routes.push({
        route: route.trim(),
        size: size.trim(),
        firstLoad: firstLoad.trim(),
      })
    }
  })

  return routes
}

function generateComment() {
  const bundleDir = 'bundle-analysis'

  // Check if files exist
  const mainStatsPath = path.join(bundleDir, 'main-stats.json')
  const prStatsPath = path.join(bundleDir, 'pr-stats.json')
  const mainBuildPath = path.join(bundleDir, 'main-build.txt')
  const prBuildPath = path.join(bundleDir, 'pr-build.txt')

  let comment = '# 📦 Bundle Size Report\n\n'

  // Try webpack stats comparison
  if (fs.existsSync(mainStatsPath) && fs.existsSync(prStatsPath)) {
    const mainStats = JSON.parse(fs.readFileSync(mainStatsPath, 'utf8'))
    const prStats = JSON.parse(fs.readFileSync(prStatsPath, 'utf8'))

    const totalChange = formatDiff(mainStats.totalSize, prStats.totalSize)
    const changeIcon = getChangeIcon(mainStats.totalSize, prStats.totalSize)

    // Overall Bundle Size
    comment += `## ${changeIcon} Overall Bundle Size\n\n`
    comment += `| Branch | Total Size | Change |\n`
    comment += `|--------|------------|--------|\n`
    comment += `| main | ${formatBytes(mainStats.totalSize)} | - |\n`
    comment += `| PR | ${formatBytes(prStats.totalSize)} | ${totalChange} |\n\n`

    // Bundle Composition Analysis
    if (prStats.bundleAnalysis && mainStats.bundleAnalysis) {
      const prBundle = prStats.bundleAnalysis
      const mainBundle = mainStats.bundleAnalysis

      comment += `## 📊 Bundle Composition\n\n`
      comment += `| Asset Type | Main | PR | Change |\n`
      comment += `|------------|------|----|---------|\n`

      // JavaScript breakdown
      const mainJS = mainBundle.byType?.javascript?.size || 0
      const prJS = prBundle.byType?.javascript?.size || 0
      comment += `| **JavaScript** | ${formatBytes(mainJS)} | ${formatBytes(prJS)} | ${formatDiff(mainJS, prJS)} |\n`

      if (prBundle.byType?.javascript?.breakdown) {
        const { initial, vendor, async } = prBundle.byType.javascript.breakdown
        const mainBreakdown = mainBundle.byType?.javascript?.breakdown || {
          initial: { size: 0 },
          vendor: { size: 0 },
          async: { size: 0 },
        }

        comment += `| ↳ Initial Chunks | ${formatBytes(mainBreakdown.initial.size)} | ${formatBytes(initial.size)} | ${formatDiff(mainBreakdown.initial.size, initial.size)} |\n`
        comment += `| ↳ Vendor Chunks | ${formatBytes(mainBreakdown.vendor.size)} | ${formatBytes(vendor.size)} | ${formatDiff(mainBreakdown.vendor.size, vendor.size)} |\n`
        comment += `| ↳ Async Chunks | ${formatBytes(mainBreakdown.async.size)} | ${formatBytes(async.size)} | ${formatDiff(mainBreakdown.async.size, async.size)} |\n`
      }

      // CSS
      const mainCSS = mainBundle.byType?.css?.size || 0
      const prCSS = prBundle.byType?.css?.size || 0
      if (prCSS > 0 || mainCSS > 0) {
        comment += `| **CSS** | ${formatBytes(mainCSS)} | ${formatBytes(prCSS)} | ${formatDiff(mainCSS, prCSS)} |\n`
      }

      // Media assets
      const mainMedia = mainBundle.byType?.media?.size || 0
      const prMedia = prBundle.byType?.media?.size || 0
      if (prMedia > 0 || mainMedia > 0) {
        comment += `| **Media/Fonts** | ${formatBytes(mainMedia)} | ${formatBytes(prMedia)} | ${formatDiff(mainMedia, prMedia)} |\n`
      }

      comment += '\n'
    }

    // Dependency Analysis
    if (prStats.dependencyAnalysis && prStats.dependencyAnalysis.largest.length > 0) {
      const prDeps = prStats.dependencyAnalysis
      const mainDeps = mainStats.dependencyAnalysis || { totalSize: 0, largest: [] }

      comment += `## 📦 Dependencies Analysis\n\n`
      comment += `**Total Dependencies:** ${formatBytes(prDeps.totalSize)} `
      if (mainDeps.totalSize > 0) {
        comment += `(${formatDiff(mainDeps.totalSize, prDeps.totalSize)})`
      }
      comment += `\n\n`

      if (prDeps.largest.length > 0) {
        comment += `**Top Dependencies:**\n\n`
        comment += `| Package | Size | Modules |\n`
        comment += `|---------|------|---------|\n`

        const mainDepsMap = new Map(mainDeps.largest.map(dep => [dep.name, dep]))

        prDeps.largest.slice(0, 8).forEach(dep => {
          const mainDep = mainDepsMap.get(dep.name)
          const sizeDisplay = mainDep
            ? `${formatBytes(dep.size)} (${formatDiff(mainDep.size, dep.size)})`
            : `${formatBytes(dep.size)} (NEW)`

          comment += `| \`${dep.name}\` | ${sizeDisplay} | ${dep.moduleCount} |\n`
        })
        comment += '\n'
      }
    }

    // Performance Impact
    if (prStats.performanceMetrics) {
      const prPerf = prStats.performanceMetrics
      const mainPerf = mainStats.performanceMetrics || { initialBundle: { size: 0 } }

      comment += `## ⚡ Performance Impact\n\n`

      // Initial bundle performance
      const initialChange = formatDiff(mainPerf.initialBundle?.size || 0, prPerf.initialBundle.size)
      comment += `**Initial Bundle:** ${formatBytes(prPerf.initialBundle.size)} (${initialChange})\n`
      comment += `**Estimated Load Times:**\n`
      comment += `- 3G: ~${prPerf.initialBundle.estimatedLoad3G}\n`
      comment += `- Cable: ~${prPerf.initialBundle.estimatedLoadCable}\n\n`

      // Compression opportunity
      if (prPerf.compressionOpportunity) {
        const comp = prPerf.compressionOpportunity
        comment += `**Compression Opportunity:** ${formatBytes(comp.potentialSavings)} potential gzip savings\n\n`
      }
    }

    // Framework/Category Breakdown
    if (prStats.bundleAnalysis?.byCategory) {
      const categories = prStats.bundleAnalysis.byCategory
      const mainCategories = mainStats.bundleAnalysis?.byCategory || {}

      comment += `## 🏗️ Framework & Libraries\n\n`
      comment += `| Category | Main | PR | Change |\n`
      comment += `|----------|------|----|---------|\n`

      // Framework analysis
      if (categories.framework) {
        const prFramework = categories.framework
        const mainFramework = mainCategories.framework || {
          thirdParty: { size: 0 },
          react: { size: 0 },
          nextjs: { size: 0 },
        }

        comment += `| **Next.js** | ${formatBytes(mainFramework.nextjs?.size || 0)} | ${formatBytes(prFramework.nextjs?.size || 0)} | ${formatDiff(mainFramework.nextjs?.size || 0, prFramework.nextjs?.size || 0)} |\n`
        comment += `| **React** | ${formatBytes(mainFramework.react?.size || 0)} | ${formatBytes(prFramework.react?.size || 0)} | ${formatDiff(mainFramework.react?.size || 0, prFramework.react?.size || 0)} |\n`
        comment += `| **Third-party** | ${formatBytes(mainFramework.thirdParty?.size || 0)} | ${formatBytes(prFramework.thirdParty?.size || 0)} | ${formatDiff(mainFramework.thirdParty?.size || 0, prFramework.thirdParty?.size || 0)} |\n`
      }

      // UI analysis
      if (categories.ui) {
        const prUI = categories.ui
        const mainUI = mainCategories.ui || { styling: { size: 0 }, components: { size: 0 } }

        comment += `| **UI Styling** | ${formatBytes(mainUI.styling?.size || 0)} | ${formatBytes(prUI.styling?.size || 0)} | ${formatDiff(mainUI.styling?.size || 0, prUI.styling?.size || 0)} |\n`
        comment += `| **UI Components** | ${formatBytes(mainUI.components?.size || 0)} | ${formatBytes(prUI.components?.size || 0)} | ${formatDiff(mainUI.components?.size || 0, prUI.components?.size || 0)} |\n`
      }

      // i18n analysis
      if (categories.i18n && categories.i18n.totalSize > 0) {
        const prI18n = categories.i18n
        const mainI18n = mainCategories.i18n || { totalSize: 0 }

        comment += `| **Internationalization** | ${formatBytes(mainI18n.totalSize || 0)} | ${formatBytes(prI18n.totalSize)} | ${formatDiff(mainI18n.totalSize || 0, prI18n.totalSize)} |\n`
      }

      comment += '\n'
    }

    // Significant File Changes
    const mainAssets = new Map(mainStats.assets.map(a => [a.name, a]))
    const significantChanges = []

    prStats.assets.forEach(asset => {
      const mainAsset = mainAssets.get(asset.name)
      if (mainAsset) {
        const diff = asset.size - mainAsset.size
        const pct = Math.abs((diff / mainAsset.size) * 100)
        if (pct > 5 || Math.abs(diff) > 10000) {
          significantChanges.push({
            name: asset.name,
            mainSize: mainAsset.size,
            prSize: asset.size,
            diff,
            pct,
          })
        }
      } else if (asset.size > 5000) {
        significantChanges.push({
          name: asset.name,
          mainSize: 0,
          prSize: asset.size,
          diff: asset.size,
          pct: Infinity,
          isNew: true,
        })
      }
    })

    if (significantChanges.length > 0) {
      comment += `## 📁 Significant File Changes\n\n`
      comment += `| File | Main | PR | Change |\n`
      comment += `|------|------|----|---------|\n`

      significantChanges
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
        .slice(0, 12)
        .forEach(change => {
          const icon = change.isNew ? '🆕' : getChangeIcon(change.mainSize, change.prSize)
          const mainSize = change.isNew ? '-' : formatBytes(change.mainSize)
          const changeText = change.isNew ? 'NEW' : formatDiff(change.mainSize, change.prSize)

          comment += `| ${icon} \`${change.name}\` | ${mainSize} | ${formatBytes(change.prSize)} | ${changeText} |\n`
        })
      comment += '\n'
    }

    // Largest Files (for context)
    if (prStats.bundleAnalysis?.largestFiles) {
      comment += `## 🔍 Largest Files\n\n`
      comment += `| File | Size | Type |\n`
      comment += `|------|------|------|\n`

      prStats.bundleAnalysis.largestFiles.slice(0, 8).forEach(file => {
        comment += `| \`${file.name}\` | ${formatBytes(file.size)} | ${file.type} |\n`
      })
      comment += '\n'
    }
  }

  // Next.js route comparison
  const mainRoutes = parseNextJsBuildOutput(mainBuildPath)
  const prRoutes = parseNextJsBuildOutput(prBuildPath)

  if (mainRoutes.length > 0 && prRoutes.length > 0) {
    comment += `## 🛣️ Route Analysis\n\n`
    comment += `| Route | Status |\n`
    comment += `|-------|--------|\n`

    const mainRouteMap = new Map(mainRoutes.map(r => [r.route, r]))
    const newRoutes = prRoutes.filter(r => !mainRouteMap.has(r.route))
    const changedRoutes = prRoutes.filter(r => {
      const mainRoute = mainRouteMap.get(r.route)
      return mainRoute && mainRoute.firstLoad !== r.firstLoad
    })

    newRoutes.slice(0, 5).forEach(route => {
      comment += `| \`${route.route}\` | 🆕 NEW (${route.firstLoad}) |\n`
    })

    changedRoutes.slice(0, 5).forEach(route => {
      const mainRoute = mainRouteMap.get(route.route)
      comment += `| \`${route.route}\` | ${mainRoute.firstLoad} → ${route.firstLoad} |\n`
    })

    if (newRoutes.length === 0 && changedRoutes.length === 0) {
      comment += `| - | No significant route changes |\n`
    }
    comment += '\n'
  }

  // Overall Assessment
  if (fs.existsSync(mainStatsPath) && fs.existsSync(prStatsPath)) {
    const mainStats = JSON.parse(fs.readFileSync(mainStatsPath, 'utf8'))
    const prStats = JSON.parse(fs.readFileSync(prStatsPath, 'utf8'))
    const impact = ((prStats.totalSize - mainStats.totalSize) / mainStats.totalSize) * 100

    comment += `## 🎯 Overall Assessment\n\n`

    if (impact > 20) {
      comment += `🔴 **CRITICAL**: Bundle size increased by ${impact.toFixed(1)}%. This may significantly impact performance.\n`
      comment += `**Recommendations:**\n`
      comment += `- Consider code splitting for large dependencies\n`
      comment += `- Implement lazy loading for non-critical features\n`
      comment += `- Review if all new dependencies are necessary\n`
      comment += `- Consider dynamic imports for large modules\n\n`
    } else if (impact > 10) {
      comment += `🟡 **WARNING**: Bundle size increased by ${impact.toFixed(1)}%. Consider optimization.\n`
      comment += `**Recommendations:**\n`
      comment += `- Review new dependencies and their necessity\n`
      comment += `- Consider lazy loading for new features\n`
      comment += `- Check for unintended duplicate dependencies\n\n`
    } else if (impact > 5) {
      comment += `🟠 **MODERATE**: Bundle size increased by ${impact.toFixed(1)}%. Monitor for future changes.\n\n`
    } else if (impact > 2) {
      comment += `🟢 **MINOR**: Bundle size increased by ${impact.toFixed(1)}%. Acceptable increase.\n\n`
    } else if (impact > 0) {
      comment += `✅ **MINIMAL**: Bundle size increased by ${impact.toFixed(1)}%. No action needed.\n\n`
    } else {
      comment += `🎉 **EXCELLENT**: Bundle size decreased by ${Math.abs(impact).toFixed(1)}% or stayed the same!\n\n`
    }
  }

  comment += `---\n`
  comment += `*Generated by [Bundle Size Check Action](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions)*`

  return comment
}

// Generate and output the comment
try {
  const comment = generateComment()
  console.log(comment)
} catch (error) {
  console.error('Error generating bundle size comment:', error)
  console.log(
    '# 📦 Bundle Size Report\n\n❌ Failed to generate bundle size comparison. Check the build logs for details.',
  )
  process.exit(1)
}
