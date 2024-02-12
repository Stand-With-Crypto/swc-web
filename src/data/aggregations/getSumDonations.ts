import 'server-only'

import { Decimal } from '@prisma/client/runtime/library'

import { prismaClient } from '@/utils/server/prismaClient'

export const getSumDonations = async ({ includeFairshake }: { includeFairshake: boolean }) => {
  // there might be a way of doing this better with https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
  // but nothing wrong with some raw sql for custom aggregations
  const result: { amountUsd?: Decimal }[] = await prismaClient.$queryRaw`
    SELECT 
      SUM(amount_usd) AS amountUsd
    FROM user_action_donation
  `
  const amountUsd = result[0].amountUsd?.toNumber() || 0
  return { amountUsd: amountUsd + (includeFairshake ? 85_718_453.63 : 0) }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
