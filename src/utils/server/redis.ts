import { Redis } from '@upstash/redis'

import { requiredEnv, requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const UPSTASH_REDIS_REST_URL = requiredEnv(
  process.env.UPSTASH_REDIS_REST_URL,
  'UPSTASH_REDIS_REST_URL',
)

const UPSTASH_REDIS_REST_TOKEN = requiredOutsideLocalEnv(
  process.env.UPSTASH_REDIS_REST_TOKEN,
  'UPSTASH_REDIS_REST_TOKEN',
  'Manual sql query caching',
)

export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN ?? 'UPSTASH_REDIS_REST_TOKEN',
})
