// bin/trace-https.js – run with `node -r ./bin/trace-https` next build
import http from 'node:http'
import https from 'node:https'
import { performance } from 'node:perf_hooks'

// Track memory usage
const logMemory = () => {
  const usage = process.memoryUsage()
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
  }
}

// Extract domain and path for cleaner logging
const parseUrl = urlOrOptions => {
  if (typeof urlOrOptions === 'string') {
    try {
      const url = new URL(urlOrOptions)
      return { domain: url.hostname, path: url.pathname, full: urlOrOptions }
    } catch {
      return { domain: urlOrOptions, path: '', full: urlOrOptions }
    }
  }

  const options = urlOrOptions
  const domain = options.hostname || options.host || 'unknown'
  const path = options.path || options.pathname || '/'
  const protocol = options.protocol || (options.port === 443 ? 'https:' : 'http:')
  const full = `${protocol}//${domain}${path}`

  return { domain, path, full }
}

function wrap(mod, protocol) {
  const orig = mod.request
  mod.request = function (...args) {
    const startTime = performance.now()
    const startMemory = logMemory()
    const { domain, path, full } = parseUrl(args[0])

    console.log(`\n🌐 [${protocol}] ${domain}${path}`)
    console.log(`   📊 Memory before: ${startMemory.heapUsed}MB heap, ${startMemory.rss}MB RSS`)
    console.log(`   ⏱️  Start: ${new Date().toISOString()}`)

    const req = orig.apply(this, args)

    // Track response
    req.on('response', res => {
      const duration = Math.round(performance.now() - startTime)
      const endMemory = logMemory()
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed

      console.log(`   ✅ Response: ${res.statusCode} (${duration}ms)`)
      console.log(`   📈 Memory after: ${endMemory.heapUsed}MB heap (+${memoryDelta}MB)`)

      let responseSize = 0
      const originalOn = res.on.bind(res)

      res.on = function (event, listener) {
        if (event === 'data') {
          return originalOn('data', chunk => {
            responseSize += chunk.length
            listener(chunk)
          })
        }
        return originalOn(event, listener)
      }

      res.on('end', () => {
        const finalMemory = logMemory()
        const totalMemoryDelta = finalMemory.heapUsed - startMemory.heapUsed
        const sizeMB = Math.round((responseSize / 1024 / 1024) * 100) / 100

        console.log(`   📦 Response size: ${responseSize.toLocaleString()} bytes (${sizeMB}MB)`)
        console.log(`   🧠 Total memory impact: +${totalMemoryDelta}MB`)
        console.log(`   🏁 Complete: ${Math.round(performance.now() - startTime)}ms total`)

        // Flag potential memory issues
        if (totalMemoryDelta > 50) {
          console.log(`   ⚠️  WARNING: Large memory increase (+${totalMemoryDelta}MB)`)
        }
        if (responseSize > 10 * 1024 * 1024) {
          console.log(`   ⚠️  WARNING: Large response (${sizeMB}MB)`)
        }

        console.log(`   ---`)
      })
    })

    req.on('error', error => {
      const duration = Math.round(performance.now() - startTime)
      console.log(`   ❌ Error after ${duration}ms: ${error.message}`)
      console.log(`   ---`)
    })

    return req
  }
}

wrap(http, 'HTTP')
wrap(https, 'HTTPS')

console.log('🔍 HTTP/HTTPS request tracing enabled for build process')
console.log(`📊 Initial memory: ${logMemory().heapUsed}MB heap, ${logMemory().rss}MB RSS\n`)
