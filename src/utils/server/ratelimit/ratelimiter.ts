import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const cache = new Map()

export const ratelimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '120 s'),
  analytics: true,
  prefix: 'swc',
  timeout: 2000, // 2 seconds
  ephemeralCache: cache,
})
