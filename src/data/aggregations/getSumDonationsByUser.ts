import 'server-only'

import { Decimal } from '@prisma/client/runtime/library'
import { compact, keyBy } from 'lodash-es'

import { getClientLeaderboardUser } from '@/clientModels/clientUser/clientLeaderboardUser'
import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { COMMUNITY_PAGINATION_DATA } from '@/components/app/pageLeaderboard/constants'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { redis } from '@/utils/server/redis'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export type SumDonationsByUserConfig = {
  limit: number
  offset?: number
}

async function getSumDonationsByUserQuery({ limit, offset }: SumDonationsByUserConfig) {
  const total: {
    id: string
    totalDonationAmountUsd: Decimal
  }[] = await prismaClient.user.findMany({
    select: {
      id: true,
      totalDonationAmountUsd: true,
    },
    where: {
      internalStatus: 'VISIBLE',
      totalDonationAmountUsd: {
        gt: 0,
      },
    },
    orderBy: {
      totalDonationAmountUsd: 'desc',
    },
    take: limit,
    ...(offset ? { skip: offset } : {}),
  })
  return total.map(({ id, totalDonationAmountUsd }) => ({
    userId: id,
    totalAmountUsd: totalDonationAmountUsd.toNumber(),
  }))
}

type QueryResult = Awaited<ReturnType<typeof getSumDonationsByUserQuery>>

// If we ever have an nft mint action that is not a "donation", we'll need to refactor this logic
async function getSumDonationsByUserData(total: QueryResult) {
  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: compact(total.map(t => t.userId)),
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })
  const usersById = keyBy(users, 'id')
  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    compact(users.map(user => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return total.map(({ userId, totalAmountUsd }) => {
    const user = usersById[userId]
    return {
      totalAmountUsd: totalAmountUsd,
      user: {
        ...getClientLeaderboardUser(
          user,
          user.primaryUserCryptoAddress?.cryptoAddress
            ? ensDataMap[user.primaryUserCryptoAddress?.cryptoAddress]
            : null,
        ),
      },
    }
  })
}

export type SumDonationsByUser = Awaited<ReturnType<typeof getSumDonationsByUserData>>

const CACHE_KEY = 'GET_SUM_DONATIONS_BY_USER_CACHE_V6'

export async function buildGetSumDonationsByUserCache() {
  const { totalPages, itemsPerPage } =
    COMMUNITY_PAGINATION_DATA[RecentActivityAndLeaderboardTabs.LEADERBOARD]
  const result = await getSumDonationsByUserQuery({
    limit: totalPages * itemsPerPage,
    offset: 0,
  })
  await redis.set(CACHE_KEY, result, {
    ex:
      NEXT_PUBLIC_ENVIRONMENT === 'local' ? SECONDS_DURATION.SECOND : SECONDS_DURATION.MINUTE * 10,
  })
  return result
}

export async function getSumDonationsByUserWithBuildCache(config: SumDonationsByUserConfig) {
  const offset = config.offset || 0
  const maybeCache = await redis.get(CACHE_KEY)
  if (maybeCache) {
    const results = maybeCache as QueryResult
    return getSumDonationsByUserData(results.slice(offset, offset + config.limit))
  }
  const results = await buildGetSumDonationsByUserCache()
  return getSumDonationsByUserData(results.slice(offset, offset + config.limit))
}

export async function getSumDonationsByUser(config: SumDonationsByUserConfig) {
  const result = await getSumDonationsByUserQuery(config)
  return getSumDonationsByUserData(result)
}
