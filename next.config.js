const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'

const contentSecurityPolicy = {
  'default-src': ["'self'", 'blob:'],
  'media-src': ["'self'", 'blob:', 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com'],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // NextJS requires 'unsafe-inline'
  ],
  'script-src': [
    "'self'",
    isDev
      ? // NextJS requires 'unsafe-eval' in dev (faster source maps)
        "'unsafe-eval' 'unsafe-inline' blob:"
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
    'https://c.thirdweb.com/',
    'https://*.rpc.thirdweb.com/',
    'https://api-js.mixpanel.com/',
    'https://vercel.live/',
    'https://vitals.vercel-insights.com/',
  ],
  'img-src': ["'self'", 'https: data:', 'blob: data:'],
  'connect-src': [
    "'self'",
    'ws: wss:',
    'https://cloudflare-eth.com',
    'https://c.thirdweb.com/',
    // Thirdweb contract metadata
    'https://contract.thirdweb.com/',
    'https://*.rpc.thirdweb.com/',
    'https://ipfs.io/ipfs/',
    // Thirdweb contract data
    'https://*.ipfscdn.io/',
    'https://*.walletconnect.com/',
    'https://developer-access-mainnet.base.org/',
    'https://*.googleapis.com',
    'https://*.gstatic.com',
    'https://api-js.mixpanel.com/',
    '*.google.com',
    'https://vercel.live/',
    'https://vitals.vercel-insights.com/',
    'https://api-js.mixpanel.com/',
    // Mint endpoint
    'https://*.coinbase.com/',
    'https://*.sentry.io/',
  ],
  'frame-src': [
    '*.google.com',
    'https://embedded-wallet.thirdweb.com/',
    'https://www.youtube.com/embed/',
    'https://vercel.live/',
    'https://www.figma.com/embed',
  ],
  'font-src': ["'self'"],
  'object-src': ['none'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': [],
  ...(isDev ? {} : { 'upgrade-insecure-requests': [] }),
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
    destination: '/action/voter-registration',
    queryKey: 'modal',
    queryValue: 'register-to-vote',
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
    destination: '/action/sign-up',
    queryKey: 'action',
    queryValue: 'join-stand-with-crypto',
  },
  {
    destination: '/action/sign-up',
    queryKey: 'modal',
    queryValue: 'member-join',
  },
]
const V1_ACTION_REDIRECTS = ACTION_REDIRECTS.map(({ destination, queryKey, queryValue }) => ({
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
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
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
      // redirects from v1 -> v2
      ...V1_ACTION_REDIRECTS,
      {
        permanent: true,
        destination: '/action/call',
        source: '/call',
      },
      {
        permanent: false,
        destination: '/action/email?utm_source=swc&utm_medium=sms&utm_campaign=fit21-2024-05-text',
        source: '/text',
      },
      {
        permanent: true,
        destination: '/community',
        source: '/leaderboard',
      },
      {
        permanent: true,
        destination: '/action/sign-up',
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
      // vanity urls
      {
        source: '/join/:referralId',
        destination: '/action/sign-up?utm_campaign=:referralId&utm_source=swc&utm_medium=referral',
        permanent: false,
      },
      {
        source: '/politicians/person/:slug/questionnaire',
        destination: '/politicians/person/:slug#questionnaire',
        permanent: false,
      },
      // Live event campaigns
      {
        source: '/la',
        destination:
          '/action/live-event/2024_03_04_LA?utm_source=coinbase&utm_medium=live-event&utm_campaign=2024-03-04-LA',
        permanent: false,
      },
      {
        source: '/races/state',
        destination: '/races',
        permanent: false,
      },
      {
        source: '/locations/us/:paths*',
        destination: '/races/:paths*',
        permanent: true,
      },
      {
        source: '/resources/fit21/docs/FIT21%20SWC%20Founder%20Letter.pdf',
        destination: '/resources/fit21/docs/FIT21%20SWC%20Founder%20Support%20Letter.pdf',
        permanent: true,
      },
      // tweet at person campaigns
      {
        source: '/pizza',
        destination:
          '/action/tweet-at-person/2024_05_22_PIZZA_DAY?utm_source=pizzadao&utm_medium=live-event&utm_campaign=pizza-day-2024',
        permanent: false,
      },
      {
        source: '/&modal=call-your-representative&:rest*',
        destination: '/action/call?unexpectedUrl=true',
        permanent: false,
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
  project:
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 'prod-swc-web' : 'testing-swc-web',
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
