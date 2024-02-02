const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'
exports.isDev = isDev

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
