'server-only'

import { chunk } from 'lodash-es'

import { redis, redisWithCache } from '@/utils/server/redis'
import { getLogger } from '@/utils/shared/logger'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { USStateCode } from '@/utils/shared/usStateUtils'

import { CURRENT_DISTRICT_RANKING, REDIS_KEYS } from './constants'

export type DistrictRankingEntry = {
  state: USStateCode
  district: string
  count: number
}

type MemberKey = `${USStateCode}:${string}`
type RedisEntryData = Omit<DistrictRankingEntry, 'count'>

const getLog = (redisKey: string) => getLogger(redisKey)

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

const getMemberKey = (data: RedisEntryData): MemberKey => `${data.state}:${data.district}`

const parseMemberKey = (key: MemberKey): RedisEntryData => {
  const parts = key.split(':')
  const [state, district] = parts
  return { state: state as USStateCode, district }
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
    const member = getMemberKey({ district, state })
    log.info(`Adding district entry: ${member}`)
    pipeline.zadd<MemberKey>(redisKey, {
      score: 0,
      member,
    })
  })

  await pipeline.exec()

  log.info('Cache key initialized')
}

export async function createDistrictRankingUpserter(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS],
) {
  const log = getLog(redisKey)
  await maybeInitializeCacheKey(redisKey)

  return async (entry: DistrictRankingEntry) => {
    if (!isValidDistrictEntry(entry)) {
      log.warn(`Invalid district entry:`, entry)
      return {
        success: false,
        entry,
        rank: null,
      }
    }

    const member = getMemberKey(entry)
    log.info(`Upserting district entry:`, member)

    const result = await redis.zadd<MemberKey>(redisKey, {
      score: entry.count,
      member,
    })

    if (result === null) {
      log.error(`Failed to upsert district entry:`, member)
    } else {
      log.info(`Successfully upserted district entry:`, member)
    }

    return {
      success: result !== null,
      entry,
      rank: result,
    }
  }
}

type RedisInterlacedResult = Array<[MemberKey, number]>

export async function getDistrictsLeaderboardData(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS] = CURRENT_DISTRICT_RANKING,
  limit = 10,
): Promise<DistrictRankingEntry[]> {
  const rawResults = (await redisWithCache.zrange(redisKey, 0, limit - 1, {
    rev: true,
    withScores: true,
  })) as Array<MemberKey | number>

  const results = chunk(rawResults, 2) as RedisInterlacedResult

  return results.map(([member, score]) => ({
    ...parseMemberKey(member),
    count: score,
  }))
}

export async function getDistrictRank(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS] = CURRENT_DISTRICT_RANKING,
  member: RedisEntryData,
) {
  const rank = await redisWithCache.zrevrank(redisKey, getMemberKey(member))
  return rank === null ? null : rank + 1
}
