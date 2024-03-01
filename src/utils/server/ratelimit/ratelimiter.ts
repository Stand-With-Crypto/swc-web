import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const unauthenticatedEphemeralCache = new Map()
export const unauthenticatedRatelimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(8, '10 m'),
  analytics: true,
  prefix: 'swc-authed-ratelimit',
  timeout: 2000, // 2 seconds
  ephemeralCache: unauthenticatedEphemeralCache,
})

const authenticatedEphemeralCache = new Map()
export const authenticatedRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '120 s'),
  analytics: true,
  prefix: 'swc-unauthed-ratelimit',
  timeout: 2000, // 2 seconds
  ephemeralCache: authenticatedEphemeralCache,
})
