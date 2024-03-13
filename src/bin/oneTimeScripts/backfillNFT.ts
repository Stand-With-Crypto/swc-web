import { UserActionType } from '@prisma/client'
import { boolean, number, object, z } from 'zod'

import { claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('backfillNFT')

export const zodBackfillNFParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')
const ACTION_WITH_NFT: UserActionType[] = [
  UserActionType.CALL,
  UserActionType.OPT_IN,
  UserActionType.LIVE_EVENT,
  UserActionType.VOTER_REGISTRATION,
]

interface BackfillNFTResponse {
  dryRun: boolean
  actionFound: number
  airdropRequested: number
}

export async function backfillNFT(parameters: z.infer<typeof zodBackfillNFParameters>) {
  zodBackfillNFParameters.parse(parameters)
  const { limit, persist } = parameters

  const userActions = await prismaClient.userAction.findMany({
    where: {
      datetimeCreated: { gte: GO_LIVE_DATE },
      nftMint: null,
      actionType: { in: ACTION_WITH_NFT },
      user: { primaryUserCryptoAddress: { isNot: null } },
    },
    take: limit,
    include: {
      user: {
        include: { primaryUserCryptoAddress: true },
      },
    },
  })

  logger.info(userActions.length)

  if (persist === undefined || !persist) {
    logger.info('Dry run, exiting')
    return {
      dryRun: true,
      actionFound: userActions.length,
      airdropRequested: 0,
    } as BackfillNFTResponse
  }

  const promises = []
  for (const userAction of userActions) {
    promises.push(claimNFT(userAction, userAction.user.primaryUserCryptoAddress!, true))
  }
  await Promise.all(promises)

  return {
    dryRun: false,
    actionFound: userActions.length,
    airdropRequested: userActions.length,
  } as BackfillNFTResponse
}
