'use server'
'server-only'

import { SetCommandOptions } from '@upstash/redis'
import zlib from 'zlib'

import { redis, redisWithCache } from '@/utils/server/redis'
import { USStateCode } from '@/utils/shared/usStateUtils'

enum DecisionDeskKeys {
  SWC_ALL_RACES_DATA = 'SWC_ALL_RACES_DATA',
  SWC_ALL_HOUSE_DATA = 'SWC_ALL_HOUSE_DATA',
  SWC_ALL_SENATE_DATA = 'SWC_ALL_SENATE_DATA',
  SWC_PRESIDENTIAL_RACES_DATA = 'SWC_PRESIDENTIAL_RACES_DATA',
  SWC_DECISION_DESK_BEARER_TOKEN = 'SWC_DECISION_DESK_BEARER_TOKEN',
}

type StateRaceKeys = `SWC_${USStateCode}_STATE_RACES_DATA`

export type DecisionDeskRedisKeys = keyof typeof DecisionDeskKeys | StateRaceKeys

export async function setDecisionDataOnRedis(
  key: DecisionDeskRedisKeys,
  value: string,
  opts?: SetCommandOptions,
) {
  const compressedData = zlib.gzipSync(value)

  return redis.set(key, compressedData.toString('base64'), opts ?? { ex: 86400 })
}

export async function getDecisionDataFromRedis<T>(key: DecisionDeskRedisKeys) {
  const data = await redisWithCache.get<string>(key)

  if (data) {
    return JSON.parse(zlib.gunzipSync(Buffer.from(data, 'base64')).toString()) as T
  }

  return null
}

/**
 * Used to send data on chunks due to Upstash's limit of 1048576 bytes
 * so this function splits data and uses rpush to send it to redis
 */
export async function rPushDecisionDataOnRedis(key: DecisionDeskRedisKeys, value: string) {
  const upstashLimitSizeInBytes = 1048576
  const chunks = []

  for (let i = 0; i < value.length; i += upstashLimitSizeInBytes) {
    chunks.push(value.slice(i, i + upstashLimitSizeInBytes))
  }

  for (const chunk of chunks) {
    await redis.rpush(key, chunk)
  }
}

/**
 * Used to get data from redis that was sent in chunks
 */
export async function lRangeDecisionDataFromRedis(key: DecisionDeskRedisKeys) {
  const data = await redis.lrange(key, 0, -1)

  if (data) {
    return data.join('')
  }

  return null
}
