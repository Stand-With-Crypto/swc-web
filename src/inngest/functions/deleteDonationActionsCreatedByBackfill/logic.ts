import { boolean, number, object, z } from 'zod'

import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('deleteDonationActionsCreatedByBackfill')

export const zodConvertDonationActionPriceDecimalParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

interface DeleteDonationActionsCreatedByBackfillResponse {
  dryRun: boolean
  userActionsFound: number
  usersAffectedByThisChange: Array<string>
}

export async function deleteDonationActionsCreatedByBackfill(
  parameters: z.infer<typeof zodConvertDonationActionPriceDecimalParameters>,
) {
  zodConvertDonationActionPriceDecimalParameters.parse(parameters)
  const { limit, persist } = parameters

  const userActionsFound = await prismaClient.userAction.findMany({
    select: {
      id: true,
      userId: true,
      userActionDonation: {
        select: {
          id: true,
        },
      },
    },
    where: {
      userActionDonation: {
        amountCurrencyCode: { equals: 'USD' },
        coinbaseCommerceDonationId: null,
      },
      datetimeCreated: {
        gte: new Date('2024-05-28T16:30:00.000Z'),
        lte: new Date('2024-05-28T16:50:00.000Z'),
      },
    },
    ...(limit && { take: limit }),
  })

  const usersAffectedByThisChange = userActionsFound.map(action => action.userId)

  if (persist === undefined || !persist) {
    logger.info('Dry run, exiting')
    return {
      dryRun: true,
      userActionsFound: userActionsFound.length,
      usersAffectedByThisChange: [],
    } as DeleteDonationActionsCreatedByBackfillResponse
  }

  await batchAsyncAndLog(userActionsFound, actions =>
    Promise.all(
      actions.map(action => {
        if (!action.userActionDonation) return null

        return prismaClient.userActionDonation.delete({
          where: { id: action.userActionDonation.id },
        })
      }),
    ),
  )

  await batchAsyncAndLog(userActionsFound, actions =>
    Promise.all(
      actions.map(action => {
        return prismaClient.userAction.delete({
          where: { id: action.id },
        })
      }),
    ),
  )

  return {
    dryRun: false,
    userActionsFound: userActionsFound.length,
    usersAffectedByThisChange,
  } as DeleteDonationActionsCreatedByBackfillResponse
}
