import 'server-only'

import { Decimal } from '@prisma/client/runtime/library'
import { compact, keyBy } from 'lodash-es'

import { getClientLeaderboardUser } from '@/clientModels/clientUser/clientLeaderboardUser'
import {
  PAGE_LEADERBOARD_ITEMS_PER_PAGE,
  PAGE_LEADERBOARD_TOTAL_PAGES,
} from '@/components/app/pageLeaderboard/constants'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'
import { redis } from '@/utils/server/redis'
import { getLogger } from '@/utils/shared/logger'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export type SumDonationsByUserConfig = {
  limit: number
  offset?: number
}

const logger = getLogger('getSumDonationsByUser')

async function getSumDonationsByUserQuery({ limit, offset }: SumDonationsByUserConfig) {
  logger.info('triggering getSumDonationsByUser directly without cache')
  // there might be a way of doing this better with https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
  // but nothing wrong with some raw sql for custom aggregations
  const total: {
    userId: string
    totalAmountUsd: Decimal
  }[] = await prismaClient.$queryRaw`
    SELECT  
      u.id AS userId,
      COALESCE(donation_total, 0) + COALESCE(mint_total, 0) AS totalAmountUsd
    FROM (
      SELECT id 
      FROM user
      WHERE internal_status = 'VISIBLE'
    ) u

    LEFT JOIN (
      SELECT  
        ua.user_id,
        SUM(amount_usd) AS donation_total
      FROM user_action_donation
      JOIN user_action ua USING(id)  
      GROUP BY ua.user_id
    ) donation_totals ON u.id = donation_totals.user_id

    LEFT JOIN (
      SELECT  
        ua.user_id,
        SUM(cost_at_mint_usd) AS mint_total
      FROM nft_mint
      JOIN user_action ua ON ua.nft_mint_id = nft_mint.id
      WHERE ua.action_type = 'NFT_MINT' 
      GROUP BY ua.user_id
    ) mint_totals ON u.id = mint_totals.user_id

    GROUP BY u.id
    ORDER BY totalAmountUsd DESC

    -- don't worry, prisma $queryRaw sanitizes the input
    LIMIT ${limit}
    OFFSET ${offset || 0}
  `
  return total
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
      totalAmountUsd: totalAmountUsd.toNumber(),
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

const CACHE_KEY = 'GET_SUM_DONATIONS_BY_USER_CACHE_V3'

export async function buildGetSumDonationsByUserCache() {
  const result = await getSumDonationsByUserQuery({
    limit: PAGE_LEADERBOARD_TOTAL_PAGES * PAGE_LEADERBOARD_ITEMS_PER_PAGE,
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
