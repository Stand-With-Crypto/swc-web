// bin/trace-https.js – run with `node -r ./bin/trace-https` next build
import http from 'node:http'
import https from 'node:https'
import { performance } from 'node:perf_hooks'

// Also try to intercept fetch if available
let originalFetch
if (typeof globalThis.fetch !== 'undefined') {
  originalFetch = globalThis.fetch
}

// Track memory usage (simplified)
const getMemoryMB = () => Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

// Generate unique request IDs
let requestCounter = 0
const getRequestId = () => ++requestCounter

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
    const startMemory = getMemoryMB()
    const { domain, path } = parseUrl(args[0])
    const requestId = getRequestId()

    console.log(`🌐 [${protocol}:${requestId}] ${domain}${path}`)

    const req = orig.apply(this, args)

    req.on('response', res => {
      const duration = Math.round(performance.now() - startTime)
      const memoryDelta = getMemoryMB() - startMemory

      console.log(`✅ [${requestId}] ${res.statusCode} | ${duration}ms | +${memoryDelta}MB`)

      // Only warn for significant issues
      if (memoryDelta > 50) {
        console.log(`⚠️ [${requestId}] Large memory increase: +${memoryDelta}MB`)
      }
    })

    req.on('error', error => {
      const duration = Math.round(performance.now() - startTime)
      console.log(`❌ [${requestId}] ${duration}ms | ${error.message}`)
    })

    return req
  }
}

wrap(http, 'HTTP')
wrap(https, 'HTTPS')

// Intercept fetch API if available
if (originalFetch) {
  globalThis.fetch = async function (url, options = {}) {
    const startTime = performance.now()
    const startMemory = getMemoryMB()
    const requestId = getRequestId()

    let urlString = url
    if (typeof url === 'object' && url.url) {
      urlString = url.url
    } else if (typeof url === 'object' && url.href) {
      urlString = url.href
    }

    const { domain, path } = parseUrl(urlString)
    console.log(`🌐 [FETCH:${requestId}] ${domain}${path}`)

    try {
      const response = await originalFetch(url, options)
      const duration = Math.round(performance.now() - startTime)
      const memoryDelta = getMemoryMB() - startMemory

      console.log(`✅ [${requestId}] ${response.status} | ${duration}ms | +${memoryDelta}MB`)

      // Only warn for significant issues
      if (memoryDelta > 50) {
        console.log(`⚠️ [${requestId}] Large memory increase: +${memoryDelta}MB`)
      }

      return response
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      console.log(`❌ [${requestId}] ${duration}ms | ${error.message}`)
      throw error
    }
  }
}

// Note: Axios interception is complex in ES modules
// The fetch and native HTTP interception should catch most requests
// If needed, axios can be intercepted at the application level

console.log('🔍 HTTP/HTTPS/Fetch request tracing enabled')
