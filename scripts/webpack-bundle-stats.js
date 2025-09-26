// Webpack plugin to extract detailed bundle statistics
const fs = require('fs')
const path = require('path')

class BundleStatsPlugin {
  constructor(options = {}) {
    this.options = {
      outputPath: 'bundle-reports/webpack-stats.json',
      includeModules: true,
      includeAssets: true,
      includeChunks: true,
      ...options,
    }
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('BundleStatsPlugin', compilation => {
      const stats = compilation.getStats().toJson({
        all: false,
        assets: this.options.includeAssets,
        chunks: this.options.includeChunks,
        modules: this.options.includeModules,
        reasons: false,
        source: false,
      })

      // Calculate key metrics
      const analysis = {
        timestamp: new Date().toISOString(),
        buildHash: stats.hash,
        totalSize: stats.assets?.reduce((total, asset) => total + asset.size, 0) || 0,
        assets: this.options.includeAssets
          ? (stats.assets || [])
              .filter(asset => asset.name.match(/\.(js|css)$/))
              .sort((a, b) => b.size - a.size)
              .map(asset => ({
                name: asset.name,
                size: asset.size,
                type: asset.name.endsWith('.js') ? 'js' : 'css',
              }))
          : [],
        chunks: this.options.includeChunks
          ? (stats.chunks || []).map(chunk => ({
              id: chunk.id,
              size: chunk.size,
              files: chunk.files || [],
              names: chunk.names || [],
              initial: chunk.initial,
              entry: chunk.entry,
              modules: chunk.modules?.length || 0,
            }))
          : [],
        modulesBySize: this.options.includeModules
          ? (stats.modules || [])
              ?.sort((a, b) => (b.size || 0) - (a.size || 0))
              .slice(0, 50)
              .map(module => ({
                name: module.name || 'unknown',
                size: module.size || 0,
                reasons: module.reasons?.length || 0,
                type: module.type || 'unknown',
              }))
          : [],
        // Comprehensive bundle analysis
        bundleAnalysis: this.analyzeBundleComposition(stats.assets || [], stats.modules || []),
        dependencyAnalysis: this.analyzeDependencies(stats.modules || []),
        performanceMetrics: this.calculatePerformanceMetrics(
          stats.assets || [],
          stats.chunks || [],
        ),
      }

      // Ensure directory exists
      const outputDir = path.dirname(this.options.outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Write analysis
      fs.writeFileSync(this.options.outputPath, JSON.stringify(analysis, null, 2))

      console.log(`📊 Bundle stats written to: ${this.options.outputPath}`)
      console.log(`📦 Total bundle size: ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB`)

      if (analysis.bundleAnalysis?.byCategory?.i18n?.totalSize > 0) {
        console.log(
          `🌍 i18n bundle size: ${(analysis.bundleAnalysis.byCategory.i18n.totalSize / 1024).toFixed(1)} KB`,
        )
      }
    })
  }

  analyzeBundleComposition(assets, modules = []) {
    // Categorize assets by type
    const jsAssets = assets.filter(asset => asset.name.endsWith('.js'))
    const cssAssets = assets.filter(asset => asset.name.endsWith('.css'))
    const mediaAssets = assets.filter(asset =>
      asset.name.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/),
    )
    const otherAssets = assets.filter(
      asset =>
        !jsAssets.includes(asset) && !cssAssets.includes(asset) && !mediaAssets.includes(asset),
    )

    // Categorize JS by chunk type
    const initialChunks = jsAssets.filter(
      asset => asset.name.includes('main-') || asset.name.includes('pages/'),
    )
    const vendorChunks = jsAssets.filter(
      asset => asset.name.includes('vendor') || asset.name.includes('node_modules'),
    )
    const asyncChunks = jsAssets.filter(
      asset => !initialChunks.includes(asset) && !vendorChunks.includes(asset),
    )

    // Framework-specific analysis
    const frameworkAssets = this.analyzeFrameworkAssets(assets, modules)
    const i18nAssets = this.analyzeI18nAssets(assets, modules)
    const uiAssets = this.analyzeUIAssets(assets, modules)

    return {
      byType: {
        javascript: {
          size: jsAssets.reduce((sum, asset) => sum + asset.size, 0),
          count: jsAssets.length,
          breakdown: {
            initial: {
              size: initialChunks.reduce((sum, asset) => sum + asset.size, 0),
              count: initialChunks.length,
            },
            vendor: {
              size: vendorChunks.reduce((sum, asset) => sum + asset.size, 0),
              count: vendorChunks.length,
            },
            async: {
              size: asyncChunks.reduce((sum, asset) => sum + asset.size, 0),
              count: asyncChunks.length,
            },
          },
        },
        css: {
          size: cssAssets.reduce((sum, asset) => sum + asset.size, 0),
          count: cssAssets.length,
          assets: cssAssets.slice(0, 10).map(a => ({ name: a.name, size: a.size })),
        },
        media: {
          size: mediaAssets.reduce((sum, asset) => sum + asset.size, 0),
          count: mediaAssets.length,
          largestFiles: mediaAssets
            .sort((a, b) => b.size - a.size)
            .slice(0, 5)
            .map(a => ({ name: a.name, size: a.size })),
        },
        other: {
          size: otherAssets.reduce((sum, asset) => sum + asset.size, 0),
          count: otherAssets.length,
        },
      },
      byCategory: {
        framework: frameworkAssets,
        i18n: i18nAssets,
        ui: uiAssets,
      },
      largestFiles: assets
        .sort((a, b) => b.size - a.size)
        .slice(0, 20)
        .map(asset => ({
          name: asset.name,
          size: asset.size,
          type: this.categorizeAsset(asset.name),
        })),
    }
  }

  analyzeFrameworkAssets(assets, modules) {
    // Next.js framework assets
    const nextAssets = assets.filter(
      asset => asset.name.includes('_next/') || asset.name.includes('next/'),
    )

    // React assets
    const reactModules = modules.filter(
      module => module.name && (module.name.includes('react') || module.name.includes('react-dom')),
    )

    // Third-party libraries
    const thirdPartyModules = modules.filter(
      module => module.name && module.name.includes('node_modules'),
    )

    return {
      nextjs: {
        size: nextAssets.reduce((sum, asset) => sum + asset.size, 0),
        count: nextAssets.length,
      },
      react: {
        size: reactModules.reduce((sum, module) => sum + (module.size || 0), 0),
        count: reactModules.length,
      },
      thirdParty: {
        size: thirdPartyModules.reduce((sum, module) => sum + (module.size || 0), 0),
        count: thirdPartyModules.length,
        topLibraries: this.getTopLibraries(thirdPartyModules),
      },
    }
  }

  analyzeI18nAssets(assets, modules) {
    // FormatJS/Intl assets
    const formatjsAssets = assets.filter(
      asset =>
        asset.name.includes('formatjs') ||
        asset.name.includes('react-intl') ||
        asset.name.includes('@formatjs'),
    )

    // i18n modules
    const i18nModules = modules.filter(
      module =>
        module.name &&
        (module.name.includes('createI18nMessages') ||
          module.name.includes('getServerTranslation') ||
          module.name.includes('/i18n/')),
    )

    // Country/locale specific chunks
    const localeAssets = assets.filter(
      asset => asset.name.match(/\/(us|au|ca|gb|eu)[\/\-]/) || asset.name.includes('locale'),
    )

    return {
      totalSize:
        formatjsAssets.reduce((sum, asset) => sum + asset.size, 0) +
        i18nModules.reduce((sum, module) => sum + (module.size || 0), 0) +
        localeAssets.reduce((sum, asset) => sum + asset.size, 0),
      formatjs: {
        size: formatjsAssets.reduce((sum, asset) => sum + asset.size, 0),
        count: formatjsAssets.length,
      },
      components: {
        size: i18nModules.reduce((sum, module) => sum + (module.size || 0), 0),
        count: i18nModules.length,
      },
      locales: {
        size: localeAssets.reduce((sum, asset) => sum + asset.size, 0),
        count: localeAssets.length,
      },
    }
  }

  analyzeUIAssets(assets, modules) {
    // CSS/styling related
    const stylingModules = modules.filter(
      module =>
        module.name &&
        (module.name.includes('tailwind') ||
          module.name.includes('radix-ui') ||
          module.name.includes('@radix') ||
          module.name.includes('lucide') ||
          module.name.includes('css')),
    )

    // UI component libraries
    const uiLibraryModules = modules.filter(
      module =>
        module.name &&
        (module.name.includes('@radix-ui') ||
          module.name.includes('cmdk') ||
          module.name.includes('sonner') ||
          module.name.includes('vaul')),
    )

    return {
      styling: {
        size: stylingModules.reduce((sum, module) => sum + (module.size || 0), 0),
        count: stylingModules.length,
      },
      components: {
        size: uiLibraryModules.reduce((sum, module) => sum + (module.size || 0), 0),
        count: uiLibraryModules.length,
      },
    }
  }

  analyzeDependencies(modules) {
    const dependencies = new Map()

    modules
      .filter(module => module.name && module.name.includes('node_modules'))
      .forEach(module => {
        const match = module.name.match(/node_modules\/([^/]+)/)
        if (match) {
          const depName = match[1]
          const existing = dependencies.get(depName) || { size: 0, count: 0 }
          dependencies.set(depName, {
            size: existing.size + (module.size || 0),
            count: existing.count + 1,
          })
        }
      })

    const sortedDeps = Array.from(dependencies.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 15)

    return {
      totalSize: Array.from(dependencies.values()).reduce((sum, dep) => sum + dep.size, 0),
      count: dependencies.size,
      largest: sortedDeps.map(([name, data]) => ({
        name,
        size: data.size,
        moduleCount: data.count,
      })),
    }
  }

  calculatePerformanceMetrics(assets, chunks) {
    // Calculate loading metrics
    const initialChunks = chunks.filter(chunk => chunk.initial)
    const asyncChunks = chunks.filter(chunk => !chunk.initial)

    const initialSize = initialChunks.reduce((sum, chunk) => sum + (chunk.size || 0), 0)
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0)

    // Estimate loading times (rough calculation)
    const estimatedLoad3G = Math.ceil(initialSize / (50 * 1024)) // 50KB/s for 3G
    const estimatedLoadCable = Math.ceil(initialSize / (1000 * 1024)) // 1MB/s for cable

    return {
      initialBundle: {
        size: initialSize,
        chunkCount: initialChunks.length,
        estimatedLoad3G: `${estimatedLoad3G}s`,
        estimatedLoadCable: `${estimatedLoadCable}s`,
      },
      asyncBundle: {
        size: totalSize - initialSize,
        chunkCount: asyncChunks.length,
      },
      compressionOpportunity: this.calculateCompressionOpportunity(assets),
    }
  }

  calculateCompressionOpportunity(assets) {
    // Estimate compression savings for text-based assets
    const textAssets = assets.filter(asset => asset.name.match(/\.(js|css|html|json|xml|svg)$/))

    const textSize = textAssets.reduce((sum, asset) => sum + asset.size, 0)
    const estimatedGzipSize = textSize * 0.3 // Rough estimate: gzip reduces by ~70%

    return {
      uncompressed: textSize,
      estimatedGzipped: Math.floor(estimatedGzipSize),
      potentialSavings: Math.floor(textSize - estimatedGzipSize),
    }
  }

  getTopLibraries(modules) {
    const libraries = {}

    modules.forEach(module => {
      if (module.name && module.name.includes('node_modules')) {
        const match = module.name.match(/node_modules\/([^/]+)/)
        if (match) {
          const libName = match[1]
          libraries[libName] = (libraries[libName] || 0) + (module.size || 0)
        }
      }
    })

    return Object.entries(libraries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, size]) => ({ name, size }))
  }

  categorizeAsset(filename) {
    if (filename.endsWith('.js')) return 'JavaScript'
    if (filename.endsWith('.css')) return 'CSS'
    if (filename.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return 'Image'
    if (filename.match(/\.(woff|woff2|ttf|eot)$/)) return 'Font'
    return 'Other'
  }
}

module.exports = BundleStatsPlugin
