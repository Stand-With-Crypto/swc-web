import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const cache = new Map()

export const ratelimiter = new Ratelimit({
  analytics: true,
  // 2 seconds
  ephemeralCache: cache,

  limiter: Ratelimit.slidingWindow(10, '120 s'),

  prefix: 'swc',

  redis: Redis.fromEnv(),
  timeout: 2000,
})
