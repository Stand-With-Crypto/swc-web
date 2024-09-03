import * as Sentry from '@sentry/nextjs'

const RESOLVERS = [
  {
    match: (url: string) => url.startsWith('https://'),
    resolve: (url: string) => url,
  },
  {
    match: (url: string) => url.startsWith('ipfs://'),
    resolve: (url: string) => `https://ipfs.io/ipfs/${url.slice(7)}`,
  },
  {
    match: (url: string) => url.startsWith('data:image/svg+xml;base64'),
    resolve: (url: string) => url,
  },
]

export function parseENSImageUrl(avatar: string) {
  avatar = avatar.trim()

  for (const resolver of RESOLVERS) {
    if (resolver.match(avatar)) {
      return resolver.resolve(avatar)
    }
  }

  Sentry.captureMessage(`Unknown ENS avatar format`, {
    extra: { avatar },
  })
}
