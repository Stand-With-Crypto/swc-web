import { redis, redisWithCache } from '@/utils/server/redis'
import { logger } from '@/utils/shared/logger'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/usStateUtils'

import { REDIS_KEYS } from './constants'

export type DistrictRankingEntry = {
  state: string
  district: string
  count: number
}

function isValidDistrictEntry(entry: DistrictRankingEntry): boolean {
  return (
    typeof entry.state === 'string' &&
    entry.state.length > 0 &&
    typeof entry.district === 'string' &&
    entry.district.length > 0 &&
    typeof entry.count === 'number' &&
    !isNaN(entry.count)
  )
}

function getAllPossibleDistricts(): DistrictRankingEntry[] {
  const districts: DistrictRankingEntry[] = []

  Object.entries(US_STATE_CODE_TO_DISTRICT_COUNT_MAP).forEach(([state, districtCount]) => {
    // Skip states with no districts (e.g., DC) // TODO: Figure a way to show DC in the rankings
    if (districtCount === 0) return

    for (let i = 1; i <= districtCount; i++) {
      districts.push({
        state: state as USStateCode,
        district: i.toString(),
        count: 0,
      })
    }
  })

  return districts
}

async function maybeInitializeCacheKey(redisKey: string) {
  const existingCount = await redisWithCache.zcard(redisKey)

  if (existingCount > 0) {
    return
  }

  const pipeline = redisWithCache.pipeline()
  const districts = getAllPossibleDistricts()

  districts.forEach(({ district, state }) => {
    pipeline.zadd(redisKey, {
      score: 0,
      member: JSON.stringify({ district, state }),
    })
  })

  await pipeline.exec()
}

export function createDistrictRankingUpserter(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS],
) {
  return async (entry: DistrictRankingEntry) => {
    if (!isValidDistrictEntry(entry)) {
      logger.warn(`[${redisKey}] Invalid district entry:`, { entry })
      return {
        success: false,
        entry,
        rank: null,
      }
    }

    await maybeInitializeCacheKey(redisKey)

    const member = JSON.stringify({ district: entry.district, state: entry.state })
    logger.info(`[${redisKey}] Upserting district entry:`, member)

    const result = await redis.zadd(redisKey, {
      score: entry.count,
      member,
    })

    if (result === null) {
      logger.warn(`[${redisKey}] Failed to upsert district entry:`, { entry })
    } else {
      logger.info(`[${redisKey}] Upserted district entry:`, { entry })
    }

    return {
      success: result !== null,
      entry,
      rank: result,
    }
  }
}

type RedisZRangeResult = [string, number][]

export async function getDistrictRanking(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS],
  limit = 10,
): Promise<DistrictRankingEntry[]> {
  const results = await redisWithCache.zrange<RedisZRangeResult>(redisKey, 0, limit - 1, {
    rev: true,
    withScores: true,
  })

  return results.map(([member, score]) => ({
    ...(JSON.parse(member) as Omit<DistrictRankingEntry, 'count'>),
    count: score,
  }))
}
