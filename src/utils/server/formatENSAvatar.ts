import * as Sentry from '@sentry/nextjs'
/**
 * expand this as we learn about additional formats
 * https://docs.ens.domains/web/avatars#uri-schemas
 */
export function formatENSAvatar(avatar: string) {
  avatar = avatar.trim()

  if (avatar.startsWith('https://')) {
    return avatar
  }
  if (avatar.startsWith('http://')) {
    return null
  }
  if (avatar.startsWith('ipfs://')) {
    avatar = `https://ipfs.io/ipfs/${avatar.slice(7)}`
    return avatar
  }
  if (avatar.startsWith('data:image/svg+xml;base64')) {
    return avatar
  }
  Sentry.captureMessage(`Unknown ENS avatar format`, {
    extra: { avatar },
  })
  return null
}
