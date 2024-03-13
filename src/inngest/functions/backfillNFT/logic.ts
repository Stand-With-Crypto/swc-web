import { UserActionType } from '@prisma/client'
import { boolean, number, object, z } from 'zod'

import { ACTION_NFT_SLUG, claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('backfillNFT')

export const zodBackfillNFParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

interface BackfillNFTResponse {
  dryRun: boolean
  actionFound: number
  airdropRequested: number
}

export async function backfillNFT(parameters: z.infer<typeof zodBackfillNFParameters>) {
  zodBackfillNFParameters.parse(parameters)
  const { limit, persist } = parameters

  const actionsWithNFT: UserActionType[] = []
  for (const key in ACTION_NFT_SLUG) {
    const actionType = UserActionType[key as keyof typeof UserActionType]
    if (ACTION_NFT_SLUG[actionType]) {
      actionsWithNFT.push(UserActionType[actionType])
    }
  }

  logger.info(actionsWithNFT)

  const userActions = await prismaClient.userAction.findMany({
    where: {
      datetimeCreated: { gte: GO_LIVE_DATE },
      nftMint: null,
      actionType: { in: actionsWithNFT },
      user: { primaryUserCryptoAddress: { isNot: null } },
    },
    take: limit,
    include: {
      user: {
        include: { primaryUserCryptoAddress: true },
      },
    },
  })

  if (persist === undefined || !persist) {
    logger.info('Dry run, exiting')
    return {
      dryRun: true,
      actionFound: userActions.length,
      airdropRequested: 0,
    } as BackfillNFTResponse
  }

  await batchAsyncAndLog(userActions, actions =>
    Promise.all(
      actions.map(action => claimNFT(action, action.user.primaryUserCryptoAddress!, false)),
    ),
  )

  return {
    dryRun: false,
    actionFound: userActions.length,
    airdropRequested: userActions.length,
  } as BackfillNFTResponse
}
