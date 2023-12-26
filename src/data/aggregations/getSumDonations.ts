import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'
import { Decimal } from '@prisma/client/runtime/library'
import 'server-only'

export const getSumDonations = async () => {
  // there might be a way of doing this better with https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
  // but nothing wrong with some raw sql for custom aggregations
  const result: { amountUsd?: Decimal }[] = await prismaClient.$queryRaw`
    SELECT 
      SUM(amount_usd) AS amountUsd
    FROM user_action_donation
  `
  const amountUsd = result[0].amountUsd
  return { amountUsd: amountUsd?.toNumber() || 0 }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
