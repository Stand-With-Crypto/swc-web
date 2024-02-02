const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'local'

const staticItems = {
  'default-src': ["'self'", 'blob:'],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // NextJS requires 'unsafe-inline'
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
  ],
  'frame-src': [
    '*.google.com',
    'https://embedded-wallet.thirdweb.com/',
    'https://www.youtube.com/embed/',
  ],
  'font-src': ["'self'"],
  'object-src': ['none'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': [],
}
export function generateCSPHeader() {
  const nonce = `nonce-${Buffer.from(crypto.randomUUID()).toString('base64')}`
  const dynamicItems = {
    'script-src': [
      "'self'",
      isDev
        ? // NextJS requires 'unsafe-eval' in dev (faster source maps)
          "'unsafe-eval' 'unsafe-inline'"
        : /*
                Streaming react server components with next.js relies on adding inline scripts to the page as content
                is progressively streamed in. https://github.com/vercel/next.js/discussions/42170#discussioncomment-8137079
                a nonce strategy won't work as it requires all our pages to be dynamically generated https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy#adding-a-nonce-with-middleware
        
                These tradeoffs are establish
                */

          `'${nonce}'`,
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
  }
  const cspHeader = Object.entries({ ...dynamicItems, ...staticItems }).reduce(
    (acc, [key, value]) => {
      return `${acc}${key} ${value.join(' ')};`
    },
    '',
  )
  return { cspHeader, nonce }
}
