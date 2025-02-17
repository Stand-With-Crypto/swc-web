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

type RedisEntryData = Omit<DistrictRankingEntry, 'count'>

const getLog =
  (redisKey: string) =>
  (message: string, ...args: any[]) =>
    logger.info(`[${redisKey}] ${message}`, ...args)

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
    if (districtCount === 0) {
      districts.push({
        state: state as USStateCode,
        district: 'N/A',
        count: 0,
      })
    } else {
      for (let i = 1; i <= districtCount; i++) {
        districts.push({
          state: state as USStateCode,
          district: i.toString(),
          count: 0,
        })
      }
    }
  })

  return districts
}

async function maybeInitializeCacheKey(redisKey: string) {
  const log = getLog(redisKey)
  const existingCount = await redisWithCache.zcard(redisKey)

  if (existingCount > 0) {
    return
  }

  const pipeline = redisWithCache.pipeline()
  const districts = getAllPossibleDistricts()

  districts.forEach(({ district, state }) => {
    const member: RedisEntryData = { district, state }
    log(`Adding district entry: ${JSON.stringify(member)}`)
    pipeline.zadd<RedisEntryData>(redisKey, {
      score: 0,
      member,
    })
  })

  await pipeline.exec()

  log('Cache key initialized')
}

export async function createDistrictRankingUpserter(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS],
) {
  const log = getLog(redisKey)
  await maybeInitializeCacheKey(redisKey)

  return async (entry: DistrictRankingEntry) => {
    if (!isValidDistrictEntry(entry)) {
      log(`Invalid district entry:`, entry)
      return {
        success: false,
        entry,
        rank: null,
      }
    }

    const member: RedisEntryData = { district: entry.district, state: entry.state }
    log(`Upserting district entry:`, member)

    const result = await redis.zadd<RedisEntryData>(redisKey, {
      score: entry.count,
      member,
    })

    if (result === null) {
      log(`Failed to upsert district entry:`, member)
    } else {
      log(`Successfully upserted district entry:`, member)
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
