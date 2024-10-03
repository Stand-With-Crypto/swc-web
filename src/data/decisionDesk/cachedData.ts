import { redis } from '@/utils/server/redis'

export enum DECISION_DESK_REDIS_KEYS {
  ALL_RACES_DATA = 'ALL_RACES_DATA',
  PRESIDENTIAL_RACES_DATA = 'PRESIDENTIAL_RACES_DATA',
}

export async function setDecisionDataOnRedis(
  key: keyof typeof DECISION_DESK_REDIS_KEYS,
  value: string,
) {
  return redis.set(key, value, { ex: 86400 })
}

export async function getDecisionDataFromRedis<T extends {}>(
  key: keyof typeof DECISION_DESK_REDIS_KEYS,
) {
  return redis.get<T>(key)
}
