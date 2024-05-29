import { Decimal } from '@prisma/client/runtime/library'
import { boolean, number, object, z } from 'zod'

import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('convertDonationActionPriceDecimal')

export const zodConvertDonationActionPriceDecimalParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

interface ConvertDonationActionPriceDecimalResponse {
  dryRun: boolean
  donationActionsFound: number
}

export async function convertDonationActionPriceDecimal(
  parameters: z.infer<typeof zodConvertDonationActionPriceDecimalParameters>,
) {
  zodConvertDonationActionPriceDecimalParameters.parse(parameters)
  const { limit, persist } = parameters

  const donationActions = await prismaClient.userActionDonation.findMany({
    select: {
      id: true,
      amount: true,
      amountUsd: true,
    },
    where: {
      amountCurrencyCode: { equals: 'USD' },
    },
    ...(limit && { take: limit }),
  })

  if (persist === undefined || !persist) {
    logger.info('Dry run, exiting')
    return {
      dryRun: true,
      donationActionsFound: donationActions.length,
    } as ConvertDonationActionPriceDecimalResponse
  }

  await batchAsyncAndLog(donationActions, actions =>
    Promise.all(
      actions.map(action => {
        return prismaClient.userActionDonation.update({
          where: {
            id: action.id,
          },
          data: {
            amount: new Decimal(String(action.amount)).abs().toFixed(6),
            amountUsd: new Decimal(String(action.amountUsd)).abs().toFixed(6),
          },
        })
      }),
    ),
  )

  return {
    dryRun: false,
    donationActionsFound: donationActions.length,
  } as ConvertDonationActionPriceDecimalResponse
}
