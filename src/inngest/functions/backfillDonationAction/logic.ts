import { DonationOrganization, UserActionType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { isNil } from 'lodash-es'
import { boolean, number, object, z } from 'zod'

import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'
import { UserActionDonationCampaignName } from '@/utils/shared/userActionCampaigns'

const logger = getLogger('backfillDonationAction')

export const zodBackfillDonationActionParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

interface BackfillDonationActionResponse {
  dryRun: boolean
  usersFound: number
}

export async function backfillDonationAction(
  parameters: z.infer<typeof zodBackfillDonationActionParameters>,
) {
  zodBackfillDonationActionParameters.parse(parameters)
  const { limit, persist } = parameters

  const usersWithNoDonationAction = await prismaClient.user.findMany({
    select: {
      id: true,
      totalDonationAmountUsd: true,
      userActions: {
        select: {
          nftMint: { select: { nftSlug: true, costAtMintUsd: true } },
        },
      },
    },
    where: {
      totalDonationAmountUsd: { gt: 0 },
      userActions: { none: { actionType: UserActionType.DONATION } },
    },
    ...(limit && { take: limit }),
  })

  if (persist === undefined || !persist) {
    logger.info('Dry run, exiting')
    return {
      dryRun: true,
      usersFound: usersWithNoDonationAction.length,
    } as BackfillDonationActionResponse
  }

  await batchAsyncAndLog(usersWithNoDonationAction, users =>
    Promise.all(
      users.map(user => {
        const nftMintCostTotal = user.userActions
          .filter(userAction => !isNil(userAction.nftMint))
          .reduce((acc, userAction) => {
            return acc + (userAction.nftMint?.costAtMintUsd.toNumber() || 0)
          }, 0)

        const isTotalDonationAmountUsdCorrect =
          user.totalDonationAmountUsd.toNumber() === nftMintCostTotal

        if (isTotalDonationAmountUsdCorrect) return null

        const priceDifference = user.totalDonationAmountUsd.toNumber() - nftMintCostTotal

        return prismaClient.userAction.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            campaignName: UserActionDonationCampaignName.DEFAULT,
            actionType: UserActionType.DONATION,
            userActionDonation: {
              create: {
                amount: new Decimal(priceDifference),
                amountCurrencyCode: 'USD',
                amountUsd: new Decimal(priceDifference),
                recipient: DonationOrganization.STAND_WITH_CRYPTO,
              },
            },
          },
        })
      }),
    ),
  )

  return {
    dryRun: false,
    usersFound: usersWithNoDonationAction.length,
  } as BackfillDonationActionResponse
}
