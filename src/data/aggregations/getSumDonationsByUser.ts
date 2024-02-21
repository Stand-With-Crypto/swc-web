import 'server-only'

import { Decimal } from '@prisma/client/runtime/library'
import _ from 'lodash'

import { getClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { getENSDataMapFromCryptoAddressesAndFailGracefully } from '@/data/web3/getENSDataFromCryptoAddress'
import { prismaClient } from '@/utils/server/prismaClient'

export type SumDonationsByUserConfig = {
  limit: number
  offset?: number
}
// If we ever have an nft mint action that is not a "donation", we'll need to refactor this logic
export const getSumDonationsByUser = async ({ limit, offset }: SumDonationsByUserConfig) => {
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
  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: _.compact(total.map(t => t.userId)),
      },
    },
    include: {
      primaryUserCryptoAddress: true,
      address: true,
    },
  })

  const usersById = _.keyBy(users, 'id')
  const ensDataMap = await getENSDataMapFromCryptoAddressesAndFailGracefully(
    _.compact(users.map(user => user.primaryUserCryptoAddress?.cryptoAddress)),
  )
  return total.map(({ userId, totalAmountUsd }) => {
    const user = usersById[userId]
    return {
      totalAmountUsd: totalAmountUsd.toNumber(),
      user: {
        ...getClientUserWithENSData(
          user,
          user.primaryUserCryptoAddress?.cryptoAddress
            ? ensDataMap[user.primaryUserCryptoAddress?.cryptoAddress]
            : null,
        ),
      },
    }
  })
}

export type SumDonationsByUser = Awaited<ReturnType<typeof getSumDonationsByUser>>
