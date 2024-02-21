import 'server-only'

import { Decimal } from '@prisma/client/runtime/library'

import { prismaClient } from '@/utils/server/prismaClient'

export const getSumDonations = async ({ includeFairshake }: { includeFairshake: boolean }) => {
  // there might be a way of doing this better with https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing
  // but nothing wrong with some raw sql for custom aggregations
  const [donations, nftMint] = await Promise.all([
    prismaClient.$queryRaw`
    SELECT 
      SUM(amount_usd) AS amountUsd
    FROM user_action_donation
  `,
    // If we ever have an nft mint action that is not a "donation", we'll need to refactor this logic
    prismaClient.$queryRaw`
    SELECT 
      SUM(cost_at_mint_usd) AS amountUsd
    FROM nft_mint
    JOIN user_action ua ON ua.nft_mint_id = nft_mint.id
    WHERE ua.action_type = 'NFT_MINT'
  `,
  ])
  const donationsResult = donations as { amountUsd?: Decimal }[]
  const nftMintResult = nftMint as { amountUsd?: Decimal }[]

  const amountUsd =
    (donationsResult[0].amountUsd?.toNumber() || 0) + (nftMintResult[0].amountUsd?.toNumber() || 0)
  return { amountUsd: amountUsd + (includeFairshake ? 85_718_453.63 : 0) }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
