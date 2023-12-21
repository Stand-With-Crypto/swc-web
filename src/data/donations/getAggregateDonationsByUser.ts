import { getClientCryptoAddressUser } from '@/clientModels/clientCryptoAddress/clientCryptoAddressUser'
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
    sessionUserId?: string
    cryptoAddressUserId?: string
    totalAmountUsd: Decimal
  }[] = await prismaClient.$queryRaw`
    SELECT 
      user_action.session_user_id as sessionUserId, 
      user_action.crypto_address_user_id as cryptoAddressUserId,
      SUM(amount_usd) AS totalAmountUsd
    FROM user_action_donation
    JOIN user_action ON user_action.id = user_action_donation.id
    GROUP BY sessionUserId, cryptoAddressUserId
    ORDER BY totalAmountUsd DESC
    -- don't worry, prisma $queryRaw sanitizes the input
    LIMIT ${limit}
  `
  // because a action can have both a session and crypto address user (we retroactively tag the crypto address user after they login post action)
  // we need to deduplicate the results
  const dedupedTotal = total.filter(
    x => x.cryptoAddressUserId || (x.sessionUserId && !x.cryptoAddressUserId),
  )

  const [cryptoAddressUsers] = await Promise.all([
    prismaClient.cryptoAddressUser.findMany({
      where: {
        id: {
          in: _.compact(dedupedTotal.map(t => t.cryptoAddressUserId)),
        },
      },
    }),
  ])

  const cryptoAddressUsersById = _.keyBy(cryptoAddressUsers, 'id')

  return dedupedTotal.map(({ cryptoAddressUserId, totalAmountUsd }) => ({
    totalAmountUsd: totalAmountUsd.toNumber(),
    cryptoAddressUser: cryptoAddressUserId
      ? getClientCryptoAddressUser(cryptoAddressUsersById[cryptoAddressUserId])
      : null,
  }))
}

export type AggregateDonationsByUser = Awaited<ReturnType<typeof getAggregateDonationsByUser>>
