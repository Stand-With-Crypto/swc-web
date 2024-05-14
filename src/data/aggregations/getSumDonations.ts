import 'server-only'

import { sum } from 'lodash-es'

import { prismaClient } from '@/utils/server/prismaClient'

const MANUALLY_TRACKED_DONATIONS = [
  85_718_453, // Fairshake donations
  1_000_000, // 2024-05-13 MoonPay donation
]

export const getSumDonations = async () => {
  const amountUsd = await prismaClient.user.aggregate({
    _sum: {
      totalDonationAmountUsd: true,
    },
  })
  return {
    amountUsd:
      (amountUsd._sum.totalDonationAmountUsd?.toNumber() || 0) + sum(MANUALLY_TRACKED_DONATIONS),
  }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
