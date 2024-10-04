import { SetCommandOptions } from '@upstash/redis'

import { redis } from '@/utils/server/redis'

export enum DECISION_DESK_REDIS_KEYS {
  ALL_RACES_DATA = 'ALL_RACES_DATA',
  PRESIDENTIAL_RACES_DATA = 'PRESIDENTIAL_RACES_DATA',
  DECISION_DESK_BEARER_TOKEN = 'DECISION_DESK_BEARER_TOKEN',
}

export async function setDecisionDataOnRedis(
  key: keyof typeof DECISION_DESK_REDIS_KEYS,
  value: string,
  opts?: SetCommandOptions,
) {
  return redis.set(key, value, opts ?? { ex: 86400 })
}

export async function getDecisionDataFromRedis<T extends object>(
  key: keyof typeof DECISION_DESK_REDIS_KEYS,
) {
  return redis.get<T>(key)
}
