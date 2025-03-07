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

export type MemberKey = `${USStateCode}:${string}`
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
        district: '1',
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

export const getMemberKey = (data: RedisEntryData): MemberKey => `${data.state}:${data.district}`

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

export async function createDistrictRankingIncrementer(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS],
) {
  const log = getLog(redisKey)
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
    const exists = await redis.zscore(redisKey, member)
    if (exists === null) {
      log.info(`District entry does not exist, creating it:`, member)
      return await redis.zadd<MemberKey>(redisKey, {
        score: entry.count,
        member,
      })
    }

    log.info(`Incrementing district entry:`, member)
    const result = await redis.zincrby<MemberKey>(redisKey, entry.count, member)

    if (result === null) {
      log.error(`Failed to increment district entry:`, member)
    } else {
      log.info(`Successfully incremented district entry:`, member)
    }

    return {
      success: result !== null,
      entry,
      rank: result,
    }
  }
}

type RedisInterlacedResult = Array<[MemberKey, number]>
export type DistrictRankingEntryWithRank = DistrictRankingEntry & { rank: number }

export type LeaderboardPaginationData = {
  items: DistrictRankingEntryWithRank[]
  total: number
}

export async function getDistrictsLeaderboardData(
  options: {
    redisKey?: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS]
    limit?: number
    offset?: number
  } = {},
): Promise<LeaderboardPaginationData> {
  const { redisKey = CURRENT_DISTRICT_RANKING, limit = 10, offset = 0 } = options

  const [rawResults, total] = await Promise.all([
    redisWithCache.zrange(redisKey, offset, offset + limit - 1, {
      rev: true,
      withScores: true,
    }) as Promise<Array<MemberKey | number>>,
    redisWithCache.zcard(redisKey),
  ])

  const results = chunk(rawResults, 2) as RedisInterlacedResult

  const items = results.map(([member, score], index) => ({
    ...parseMemberKey(member),
    count: score,
    rank: offset + index + 1,
  }))

  return {
    items,
    total,
  }
}

export async function getDistrictRank(
  redisKey: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS] = CURRENT_DISTRICT_RANKING,
  member: RedisEntryData,
) {
  const [rankResponse, scoreResponse] = await Promise.all([
    redisWithCache.zrevrank(redisKey, getMemberKey(member)),
    redisWithCache.zscore(redisKey, getMemberKey(member)),
  ])
  const rank = rankResponse === null ? null : rankResponse + 1
  const score = scoreResponse === null ? null : scoreResponse

  return {
    rank,
    score,
  }
}

export async function getMultipleDistrictRankings({
  redisKey = CURRENT_DISTRICT_RANKING,
  members,
}: {
  redisKey?: (typeof REDIS_KEYS)[keyof typeof REDIS_KEYS]
  members: MemberKey[]
}) {
  const pipeline = redisWithCache.pipeline()

  members.forEach(member => {
    pipeline.zrevrank(redisKey, member)
    pipeline.zscore(redisKey, member)
  })

  const results: number[] = await pipeline.exec()
  const rankings = []

  for (let i = 0; i < members.length; i++) {
    const rankResponse = results[i * 2]
    const scoreResponse = results[i * 2 + 1]

    const rank = rankResponse === null ? null : rankResponse + 1
    const score = scoreResponse === null ? null : scoreResponse

    rankings.push({
      member: members[i],
      rank,
      score,
    })
  }

  return rankings
}
