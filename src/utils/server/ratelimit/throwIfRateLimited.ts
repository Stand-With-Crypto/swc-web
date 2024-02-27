import { getIPFromHeaders } from '@/utils/server/getIPFromHeaders'
import {
  authenticatedRateLimiter,
  unauthenticatedRatelimiter,
} from '@/utils/server/ratelimit/ratelimiter'

export async function throwIfRateLimited({
  context = 'unauthenticated',
}: {
  context?: 'unauthenticated' | 'authenticated'
} = {}) {
  const ip = getIPFromHeaders()
  if (!ip) {
    throw new Error('no ip')
  }

  const ratelimiter =
    context === 'authenticated' ? authenticatedRateLimiter : unauthenticatedRatelimiter

  const result = await ratelimiter.limit(ip)
  if (!result.success) {
    throw new Error('Invalid request')
  }
}
