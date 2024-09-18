import { boolean, number, object, z } from 'zod'

import { actionsWithNFT } from '@/utils/server/nft/actionsWithNFT'
import { claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { batchAsyncAndLog } from '@/utils/shared/batchAsyncAndLog'
import { getLogger } from '@/utils/shared/logger'

const defaultLogger = getLogger('backfillNFT')

const zodBackfillNFParameters = object({
  limit: number().optional(),
  persist: boolean().optional(),
})

const GO_LIVE_DATE = new Date('2024-02-25 00:00:00.000')

interface BackfillNFTResponse {
  dryRun: boolean
  actionFound: number
  airdropRequested: number
}

export async function backfillNFT(
  parameters: z.infer<typeof zodBackfillNFParameters>,
  logger = defaultLogger,
) {
  zodBackfillNFParameters.parse(parameters)
  const { limit, persist } = parameters

  const userActions = await prismaClient.userAction.findMany({
    where: {
      datetimeCreated: { gte: GO_LIVE_DATE },
      nftMint: null,
      actionType: { in: actionsWithNFT },
      user: { primaryUserCryptoAddress: { isNot: null } },
    },
    ...(limit && { take: limit }),
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
      actions.map(action =>
        claimNFT(action, action.user.primaryUserCryptoAddress!, { skipTransactionFeeCheck: true }),
      ),
    ),
  )

  return {
    dryRun: false,
    actionFound: userActions.length,
    airdropRequested: userActions.length,
  } as BackfillNFTResponse
}
