import 'server-only'

import { sum } from 'lodash-es'

import { prismaClient } from '@/utils/server/prismaClient'

const FAIRSHAKE_DONATIONS_AMOUNT_USD = 204_069_689

const MANUALLY_TRACKED_DONATIONS = [
  FAIRSHAKE_DONATIONS_AMOUNT_USD,
  1_000_000, // 2024-05-13 MoonPay donation
  1_300_000, // 2024-09-23 Exodus donation
]

interface GetSumDonationsProps {
  countryCode: string
}

export const getSumDonations = async ({ countryCode }: GetSumDonationsProps) => {
  const amountUsd = await prismaClient.user.aggregate({
    _sum: {
      totalDonationAmountUsd: true,
    },
    where: {
      tenantId: countryCode,
    },
  })
  return {
    amountUsd:
      (amountUsd._sum.totalDonationAmountUsd?.toNumber() || 0) + sum(MANUALLY_TRACKED_DONATIONS),
    fairshakeAmountUsd: FAIRSHAKE_DONATIONS_AMOUNT_USD,
  }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
