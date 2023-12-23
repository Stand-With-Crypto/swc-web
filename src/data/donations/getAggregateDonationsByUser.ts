import { getClientUser } from '@/clientModels/clientUser/clientUser'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { Decimal } from '@prisma/client/runtime/library'
import _ from 'lodash'
import 'server-only'

export type AggregateDonationsByUserConfig = {
  limit: number
}

export const getAggregateDonationsByUser = async ({ limit }: AggregateDonationsByUserConfig) => {
  // there might be a way of doing this better with https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
  // but nothing wrong with some raw sql for custom aggregations
  const total: {
    userId: string
    totalAmountUsd: Decimal
  }[] = await prismaClient.$queryRaw`
    SELECT 
      user_action.user_id as userId, 
      SUM(amount_usd) AS totalAmountUsd
    FROM user_action_donation
    JOIN user_action ON user_action.id = user_action_donation.id
    GROUP BY userId
    ORDER BY totalAmountUsd DESC
    -- don't worry, prisma $queryRaw sanitizes the input
    LIMIT ${limit}
  `

  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: _.compact(total.map(t => t.userId)),
      },
    },
    include: {
      userCryptoAddress: true,
    },
  })

  const usersById = _.keyBy(users, 'id')

  return total.map(({ userId, totalAmountUsd }) => ({
    totalAmountUsd: totalAmountUsd.toNumber(),
    user: getClientUser(usersById[userId]),
  }))
}

export type AggregateDonationsByUser = Awaited<ReturnType<typeof getAggregateDonationsByUser>>
