import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { Decimal } from '@prisma/client/runtime/library'
import 'server-only'

export const getAggregateDonations = async () => {
  // there might be a way of doing this better with https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
  // but nothing wrong with some raw sql for custom aggregations
  const amountUsd: { amountUsd?: Decimal } = await prismaClient.$queryRaw`
    SELECT 
      SUM(amount_usd) AS totalAmountUsd
    FROM user_action_donation
  `
  return { amountUsd: amountUsd.amountUsd?.toNumber() || 0 }
}

export type AggregateDonations = Awaited<ReturnType<typeof getAggregateDonations>>
