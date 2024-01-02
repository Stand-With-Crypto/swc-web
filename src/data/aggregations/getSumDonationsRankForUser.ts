import { prismaClient } from '@/utils/server/prismaClient'

export type GetSumDonationsRankForUserConfig = {
  userId: string
  limit: number
}

export const getSumDonationsRankForUser = async ({
  userId,
  limit,
}: GetSumDonationsRankForUserConfig) => {
  const result: {
    donationRank: number
    totalAmountUsd: number
    offset: number
  }[] = await prismaClient.$queryRaw`
    SELECT 
      donationRank,
      totalAmountUsd,
      FLOOR((donationRank - 1) / ${limit}) * ${limit} as offset
    FROM (
      SELECT 
        user_action.user_id as userId, 
        SUM(amount_usd) AS totalAmountUsd,
        RANK() OVER (ORDER BY SUM(amount_usd) DESC) as donationRank
      FROM user_action_donation
      JOIN user_action ON user_action.id = user_action_donation.id
      GROUP BY user_action.user_id
    ) as RankedDonations
    WHERE userId = ${userId}
  `

  const {
    donationRank: rank,
    totalAmountUsd,
    offset,
  } = result[0] || { donationRank: null, offset: null }

  return {
    rank,
    totalAmountUsd,
    limit,
    offset,
  }
}
