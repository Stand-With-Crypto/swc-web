const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'

const contentSecurityPolicy = {
  'default-src': ["'self'", 'blob:'],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // NextJS requires 'unsafe-inline'
  ],
  'script-src': [
    "'self'",
    isDev
      ? // NextJS requires 'unsafe-eval' in dev (faster source maps)
        "'unsafe-eval' 'unsafe-inline'"
      : /*
        Streaming react server components within next.js relies on adding inline scripts to the page as content
        is progressively streamed in. https://github.com/vercel/next.js/discussions/42170#discussioncomment-8137079
        a nonce strategy won't work as it requires all our pages to be dynamically generated https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy#adding-a-nonce-with-middleware
        */
        "'unsafe-inline'",
    isDev ? '' : 'https://static.ads-twitter.com/uwt.js',
    'https://*.googleapis.com',
    'https://*.gstatic.com',
    '*.google.com',
    'https://static.ads-twitter.com/uwt.js',
    'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js',
    'https://va.vercel-scripts.com/v1/script.debug.js',
    'https://www.youtube.com/',
    'https://vercel.live/_next-live/feedback/feedback.js',
  ],
  'img-src': [
    "'self'",
    'blob: data:',
    'https://res.cloudinary.com/',
    'https://*.walletconnect.com/',
    'https://euc.li/',
    'https://*.googleapis.com',
    'https://*.gstatic.com',
    '*.google.com',
    'https://ipfs.io/ipfs/',
  ],
  'connect-src': [
    "'self'",
    'ws: wss:',
    'https://cloudflare-eth.com',
    'https://base.rpc.thirdweb.com/',
    'https://polygon.rpc.thirdweb.com/',
    'https://ipfs.io/ipfs/',
    'https://*.walletconnect.com/',
    'https://developer-access-mainnet.base.org/',
    'https://*.googleapis.com',
    'https://*.gstatic.com',
    '*.google.com',
    'https://vercel.live/api/event/tick',
    'https://vitals.vercel-insights.com/v1/vitals',
    'https://api-js.mixpanel.com/',
  ],
  'frame-src': [
    '*.google.com',
    'https://embedded-wallet.thirdweb.com/',
    'https://www.youtube.com/embed/',
    'https://vercel.live/',
  ],
  'font-src': ["'self'"],
  'object-src': ['none'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': [],
}

const cspObjectToString = Object.entries(contentSecurityPolicy).reduce((acc, [key, value]) => {
  return `${acc}${key} ${value.join(' ')};`
}, '')

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=15552000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },

  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: cspObjectToString,
  },
]

const ACTION_REDIRECTS = [
  {
    destination: '/action/email',
    queryKey: 'action',
    queryValue: 'email-representative',
  },
  {
    destination: '/action/email',
    queryKey: 'modal',
    queryValue: 'email-senator',
  },
  {
    destination: '/action/nft-mint',
    queryKey: 'modal',
    queryValue: 'mintNFT',
  },
  {
    destination: '/action/nft-mint',
    queryKey: 'action',
    queryValue: 'mint-nft',
  },
  {
    destination: '/action/call',
    queryKey: 'modal',
    queryValue: 'call-your-representative',
  },
  {
    destination: '/action/call',
    queryKey: 'modal',
    queryValue: 'callRepresentative',
  },
  {
    destination: '/action/call',
    queryKey: 'action',
    queryValue: 'call-your-representative',
  },
  {
    destination: '/action/opt-in',
    queryKey: 'action',
    queryValue: 'join-stand-with-crypto',
  },
  {
    destination: '/action/opt-in',
    queryKey: 'modal',
    queryValue: 'member-join',
  },
]
const V1_REDIRECTS = ACTION_REDIRECTS.map(({ destination, queryKey, queryValue }) => ({
  permanent: true,
  source: '/',
  destination,
  has: [
    {
      type: 'query',
      key: queryKey,
      value: queryValue,
    },
  ],
}))

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'euc.li',
      },
      // dotheysupportit image cdn
      { protocol: 'https', hostname: 'db0prh5pvbqwd.cloudfront.net' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      ...V1_REDIRECTS,
      {
        permanent: true,
        destination: '/action/call',
        source: '/call',
      },
      {
        permanent: true,
        destination: '/action/opt-in',
        source: '/member-join',
      },
      {
        source: '/politicians/senate',
        destination: '/politicians',
        permanent: true,
      },
      {
        source: '/politicians/house',
        destination: '/politicians',
        permanent: true,
      },
    ]
  },
}

/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: 'stand-with-crypto',
  project: 'javascript-nextjs',
}
/** @type {import('@sentry/nextjs/types/config/types').UserSentryOptions} */
const userSentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/api/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
}
// Injected content via Sentry wizard below
module.exports = withBundleAnalyzer(
  withSentryConfig(nextConfig, sentryWebpackPluginOptions, userSentryOptions),
)
