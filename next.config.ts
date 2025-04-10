import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'
const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'

const contentSecurityPolicy = {
  'default-src': ["'self'", 'blob:'],
  'media-src': [
    "'self'",
    'blob:',
    'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com',
    'https://www.youtube-nocookie.com/embed/',
    'https://cdn.builder.io/',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // NextJS requires 'unsafe-inline'
    'https://fonts.googleapis.com', // Required for newmode
    'https://*.newmode.net/',
  ],
  'script-src': [
    "'self'",
    !isProd
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
    'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js',
    'https://va.vercel-scripts.com/v1/script.debug.js',
    'https://www.youtube.com/',
    'https://c.thirdweb.com/',
    'https://*.rpc.thirdweb.com/',
    'https://api-js.mixpanel.com/',
    'https://vercel.live/',
    'https://vitals.vercel-insights.com/',
    'https://www.googletagmanager.com/',
    'https://*.amazon-adsystem.com/',
    'https://*.paa-reporting-advertising.amazon/',
    'https://*.ads-twitter.com/',
    'https://*.google-analytics.com/',
    'https://*.builder.io/',
    'https://*.newmode.net/',
    'https://js.stripe.com/', // Required for newmode
  ],
  'img-src': ["'self'", 'https: data:', 'blob: data:', 'https://cnv.event.prod.bidr.io/log/cnv'],
  'connect-src': [
    "'self'",
    'ws: wss:',
    'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com',
    'https://cloudflare-eth.com',
    'https://c.thirdweb.com/',
    'https://c.amazon-adsystem.com/',
    'https://www.googletagmanager.com/',
    'https://*.amazon-adsystem.com/',
    'https://*.paa-reporting-advertising.amazon/',
    'https://*.ads-twitter.com/',
    'https://*.google-analytics.com/',
    'https://*.builder.io/',
    // ENS
    'https://euc.li/',
    // Thirdweb contract metadata
    'https://contract.thirdweb.com/',
    'https://pay.thirdweb.com',
    'https://*.rpc.thirdweb.com/',
    'https://ipfs.io/ipfs/',
    // Thirdweb contract data
    'https://*.ipfscdn.io/',
    'https://*.walletconnect.com/',
    'https://*.walletconnect.org/',
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
    'https://*.thirdweb.com/',
    'https://api.thirdweb.com/',
    'https://embedded-wallet.thirdweb.com/',
    'https://*.newmode.net/',
    'https://api.mapbox.com/', // Required for newmode
  ],
  'frame-src': [
    '*.google.com',
    'https://embedded-wallet.thirdweb.com/',
    'https://verify.walletconnect.com/',
    'https://verify.walletconnect.org/',
    'https://www.youtube.com/embed/',
    'https://www.youtube-nocookie.com/embed/',
    'https://vercel.live/',
    'https://www.figma.com',
    'https://*.newmode.net/',
    'https://js.stripe.com/', // Required for newmode
  ],
  'font-src': ["'self'"],
  'object-src': ['none'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'", 'https://www.figma.com', 'https://builder.io'],
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
    destination: '/action/pledge',
    queryKey: 'action',
    queryValue: 'pledge-to-vote',
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
      type: 'query' as const,
      key: queryKey,
      value: queryValue,
    },
  ],
}))

const nextConfig: NextConfig = {
  experimental: {
    turbo: {},
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
      { protocol: 'https', hostname: 'testing.dotheysupportit.com' },
      { protocol: 'https', hostname: 'www.dotheysupportit.com' },
      // builder.io image cdn
      {
        protocol: 'https',
        hostname: 'cdn.builder.io',
      },
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
        permanent: true,
        destination: '/action/pledge',
        source: '/pledge',
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
      {
        source: '/action/mint-nft',
        destination: '/action/nft-mint',
        permanent: true,
      },
      {
        source: '/australia',
        destination: 'https://au.standwithcrypto.org',
        permanent: false,
      },
      {
        source: '/canada',
        destination: 'https://ca.standwithcrypto.org',
        permanent: false,
      },
      // vanity urls
      {
        source: '/join/:referralId',
        destination:
          '/action/sign-up?utm_campaign=:referralId&utm_source=swc&utm_medium=:utmMedium',
        permanent: false,
        has: [
          {
            type: 'query',
            key: 'utm_medium',
            value: '(?<utmMedium>.+)',
          },
        ],
      },
      // Fallback for when utm_medium is not present or empty
      {
        source: '/join/:referralId',
        destination: '/action/sign-up?utm_campaign=:referralId&utm_source=swc&utm_medium=referral',
        permanent: false,
        missing: [
          {
            type: 'query',
            key: 'utm_medium',
          },
        ],
      },
      // Country-specific referral redirects
      {
        source: '/:countryCode/join/:referralId',
        destination:
          '/:countryCode/action/sign-up?utm_campaign=:referralId&utm_source=swc&utm_medium=:utmMedium',
        permanent: false,
        has: [
          {
            type: 'query',
            key: 'utm_medium',
            value: '(?<utmMedium>.+)',
          },
        ],
      },
      {
        source: '/:countryCode/join/:referralId',
        destination:
          '/:countryCode/action/sign-up?utm_campaign=:referralId&utm_source=swc&utm_medium=referral',
        permanent: false,
        missing: [
          {
            type: 'query',
            key: 'utm_medium',
          },
        ],
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
        source: '/resources/fit21/docs/FIT21%20SWC%20Founder%20Letter.pdf',
        destination: '/resources/fit21/docs/FIT21%20SWC%20Founder%20Support%20Letter.pdf',
        permanent: true,
      },
      // cnn debate campaign
      {
        source: '/action/email-cnn',
        destination: '/',
        permanent: false,
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
      {
        source: '/sst',
        destination: '/action/pledge?utm_source=swc&utm_medium=event&utm_campaign=sst',
        permanent: false,
      },
      {
        source: '/alc',
        destination: '/action/pledge?utm_source=swc&utm_medium=event&utm_campaign=sst',
        permanent: false,
      },
      // Email shortlinks
      {
        source: '/e/sj-res-3',
        destination:
          '/action/email?utm_source=swc&utm_medium=email&utm_campaign=broker-reporting-rule-1',
        permanent: true,
      },
      {
        source: '/e/crahouse',
        destination:
          '/action/email?utm_source=swc&utm_medium=email&utm_campaign=broker-reporting-rule-house',
        permanent: true,
      },
      // SMS shortlinks
      {
        source: '/s/sb-1797',
        destination: 'https://speak4.app/lp/jk01insm/?ts=1744055112',
        permanent: true,
      },
      {
        source: '/new-congress-2/:sessionId*',
        destination:
          '/action/email?utm_source=swc&utm_medium=sms&utm_campaign=new-member-activation-2&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/email-congress-retry/:sessionId*',
        destination:
          '/action/email?utm_source=swc&utm_medium=sms&utm_campaign=new-member-activation-retry&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/new-congress/:sessionId*',
        destination:
          '/action/email?utm_source=swc&utm_medium=sms&utm_campaign=new-member-activation-1&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/theblocknews',
        destination:
          'https://www.theblock.co/post/331309/stand-with-crypto-advocates-flood-senate-with-107000-emails-opposing-sec-crenshaws-renomination',
        permanent: false,
      },
      {
        source: '/secvote-2/:sessionId*',
        destination:
          '/action/email?utm_source=swc&utm_medium=sms&utm_campaign=crenshawvote-2&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/secvote/:sessionId*',
        destination:
          '/action/email?utm_source=swc&utm_medium=sms&utm_campaign=crenshawvote&sessionId=:sessionId*',
        permanent: true,
      },
      // The usage of the next redirect is documented in the SWC Voter Turnout Plan document
      {
        source: '/vg/:campaignId/:sessionId*',
        destination:
          '/vote?utm_source=swc&utm_medium=sms&utm_campaign=voter-guide-:campaignId&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/voter-guide-1/:sessionId*',
        destination:
          '/vote?utm_source=swc&utm_medium=sms&utm_campaign=voter-guide-1&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/w/vote/:sessionId*',
        destination:
          '/vote?utm_source=swc&utm_medium=sms&utm_campaign=welcome_sms&utm_id=sst&utm_content=v1&sessionId=:sessionId*',
        permanent: true,
      },
      {
        source: '/voter-day-1/:sessionId*',
        destination:
          '/vote?utm_source=swc&utm_medium=sms&utm_campaign=vd_1&utm_id=sst&utm_content=v1&sessionId=:sessionId*',
        permanent: false,
      },
      {
        source: '/voter-day-2/:sessionId*',
        destination:
          '/vote?utm_source=swc&utm_medium=sms&utm_campaign=vd_1&utm_id=sst&utm_content=v2&sessionId=:sessionId*',
        permanent: false,
      },
      {
        source: '/pa/1',
        destination:
          'https://americalovescryptopa.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=pa_3&utm_id=sst',
        permanent: false,
      },
      {
        source: '/wi/1',
        destination:
          'https://americalovescryptowi.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=wi_3&utm_id=sst',
        permanent: false,
      },
      {
        source: '/nv/5',
        destination:
          'https://americalovescryptonv.splashthat.com?utm_source=swc&utm_medium=sms&utm_campaign=nv_3&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/dc/1',
        destination:
          'https://standwithcryptoday2024.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=dc_2&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/dc/2',
        destination:
          'https://standwithcryptoday2024.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=dc_2&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/nv/tour',
        destination:
          'https://americalovescryptonv.splashthat.com?utm_source=swc&utm_medium=mms_model&utm_campaign=nv_2&utm_id=sst',
        permanent: false,
      },
      {
        source: '/gotv/3',
        destination: '/?utm_source=swc&utm_medium=sms&utm_campaign=gotv-ma-1&utm_content=v1',
        permanent: false,
      },
      {
        source: '/gotv/4',
        destination: '/?utm_source=swc&utm_medium=sms&utm_campaign=gotv-ma-1&utm_content=v2',
        permanent: false,
      },
      {
        source: '/az/3',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_2&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/az/4',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_2&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/nv/3',
        destination:
          'https://americalovescryptonv.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=nv_2&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/nv/4',
        destination:
          'https://americalovescryptonv.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=nv_2&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/mi/3',
        destination:
          'https://americalovescryptomi.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=mi_2&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/mi/4',
        destination:
          'https://americalovescryptomi.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=mi_2&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/wi/3',
        destination:
          'https://americalovescryptowi.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=wi_2&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/wi/4',
        destination:
          'https://americalovescryptowi.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=wi_2&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/pa/3',
        destination:
          'https://americalovescryptopa.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=pa_2&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/pa/4',
        destination:
          'https://americalovescryptopa.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=pa_2&utm_id=sst&utm_content=v2',
        permanent: false,
      },

      {
        source: '/nv/1',
        destination:
          'https://americalovescryptonv.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=nv_1&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/nv/2',
        destination:
          'https://americalovescryptonv.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=nv_1&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/az/1',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_1&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/az/1.',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_1&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/az/1./n/nThank',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_1&utm_id=sst&utm_content=v1',
        permanent: false,
      },
      {
        source: '/az/2.',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_1&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/az/2',
        destination:
          'https://americalovescryptoaz.splashthat.com/?utm_source=swc&utm_medium=sms&utm_campaign=az_1&utm_id=sst&utm_content=v2',
        permanent: false,
      },
      {
        source: '/gotv1',
        destination: '/?utm_source=swc&utm_medium=sms&utm_campaign=0820&utm_content=v1',
        permanent: false,
      },
      {
        source: '/gotv2',
        destination: '/?utm_source=swc&utm_medium=sms&utm_campaign=0820&utm_content=v2',
        permanent: false,
      },
      {
        source: '/tweet/case-dismissed/:state',
        destination: '/api/public/x-redirect/:state',
        permanent: false,
      },
      {
        source: '/oh/1',
        destination:
          'https://americalovescryptooh.splashthat.com?utm_source=swc&utm_medium=sms&utm_campaign=oh_1&utm_id=ss',
        permanent: true,
      },

      // Vanity Links
      {
        source: '/america-loves-crypto/az/1',
        destination:
          'https://americalovescryptoaz.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=az_1&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/az/2',
        destination:
          'https://americalovescryptoaz.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=az_2&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/nv/1',
        destination:
          'https://americalovescryptonv.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=nv_1&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/nv/2',
        destination:
          'https://americalovescryptonv.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=nv_2&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/wi/1',
        destination:
          'https://americalovescryptowi.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=wi_1&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/wi/2',
        destination:
          'https://americalovescryptowi.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=wi_2&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/mi',
        destination:
          'https://americalovescryptomi.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=mi_2&utm_id=sst',
        permanent: true,
      },
      {
        source: '/america-loves-crypto/pa',
        destination:
          'https://americalovescryptopa.splashthat.com?utm_source=cb&utm_medium=inapptakeover&utm_campaign=pa_2&utm_id=sst',
        permanent: true,
      },
      {
        source: '/cb-vote-adv-push',
        destination: '/vote?utm_source=cb&utm_medium=push&utm_campaign=vote-adv',
        permanent: true,
      },
      {
        source: '/canada',
        destination: '/ca?utm_source=billboard',
        permanent: true,
      },
      {
        source: '/australia',
        destination: '/au?utm_source=billboard',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        // These rewrites are checked after headers/redirects
        // and before all files including _next/public files which
        // allows overriding page files
        {
          source: '/:locale/(mission|manifesto)',
          destination: '/:locale/about',
        },
        {
          source: '/:locale/races/province/:stateCode',
          destination: '/:locale/races/state/:stateCode',
        },
        {
          source: '/:locale/races/(province|state)/:stateCode/constituency/:path*',
          destination: '/:locale/races/state/:stateCode/district/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    }
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
  withSentryConfig(nextConfig, {
    ...sentryWebpackPluginOptions,
    ...userSentryOptions,
  }),
)
