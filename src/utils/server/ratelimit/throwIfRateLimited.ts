import { getIPFromHeaders } from '@/utils/server/getIPFromHeaders'
import { ratelimiter } from '@/utils/server/ratelimit/ratelimiter'

export async function throwIfRateLimited() {
  const ip = getIPFromHeaders()
  if (!ip) {
    throw new Error('no ip')
  }
  const result = await ratelimiter.limit(ip)
  if (!result.success) {
    throw new Error('Invalid request')
  }
}
