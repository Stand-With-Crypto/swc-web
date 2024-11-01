import 'server-only'

import { UserActionType } from '@prisma/client'
import { createClient } from 'redis'

import { prismaClient } from '@/utils/server/prismaClient'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const UPSTASH_REDIS_URL = requiredEnv(process.env.UPSTASH_REDIS_URL, 'UPSTASH_REDIS_URL')

const REDIS_KEY = 'db:count_voter_actions'
const FALLBACK_MOCK_COUNT = 502_054

function isValidCount(count: unknown) {
  return !!count && !Number.isNaN(Number(count))
}

function createRedisClient() {
  const client = createClient({
    url: UPSTASH_REDIS_URL,
  })
  client.on('error', err => console.log('Redis Client Error', err))
  void client.connect()
  return client
}

const redis = createRedisClient()

export async function getCountVoterActions() {
  const cachedCount = await redis.get(REDIS_KEY)
  return isValidCount(cachedCount) ? Number(cachedCount) : FALLBACK_MOCK_COUNT
}

export async function setVoterActionsCountCache() {
  // `prismaClient.count` doesn't support distinct, that's why we're using a raw query here
  // see https://github.com/prisma/prisma/issues/4228
  const count = await prismaClient.$queryRaw<{ count: number }[]>`
    select count(DISTINCT user_id) as count from user_action where action_type in (
      ${UserActionType.VOTER_REGISTRATION},
      ${UserActionType.VOTER_ATTESTATION},
      ${UserActionType.VOTING_INFORMATION_RESEARCHED},
      ${UserActionType.VIEW_KEY_RACES}
    )
  `.then(res => Number(res[0].count))

  if (isValidCount(count)) {
    await redis.set(REDIS_KEY, count)
  }

  return count
}
