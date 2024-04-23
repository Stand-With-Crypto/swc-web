import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'

export const getSumDonations = async ({ includeFairshake }: { includeFairshake: boolean }) => {
  const amountUsd = await prismaClient.user.aggregate({
    _sum: {
      totalDonationAmountUsd: true,
    },
  })
  return {
    amountUsd:
      (amountUsd._sum.totalDonationAmountUsd?.toNumber() || 0) +
      (includeFairshake ? 85_718_453.63 : 0),
  }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
