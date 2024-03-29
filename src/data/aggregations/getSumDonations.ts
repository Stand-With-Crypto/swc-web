import 'server-only'

import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('getSumDonations')

export const getSumDonations = async ({ includeFairshake }: { includeFairshake: boolean }) => {
  logger.info('triggering directly without cache')
  const amountUsd = await prismaClient.user.aggregate({
    _sum: {
      totalDonationAmountUsd: true,
    },
  })
  logger.info(
    `found ${amountUsd._sum.totalDonationAmountUsd?.toNumber() || 0} total donation amount usd`,
  )
  return {
    amountUsd:
      (amountUsd._sum.totalDonationAmountUsd?.toNumber() || 0) +
      (includeFairshake ? 85_718_453.63 : 0),
  }
}

export type SumDonations = Awaited<ReturnType<typeof getSumDonations>>
