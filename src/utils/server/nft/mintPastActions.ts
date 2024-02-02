import { UserActionType, UserCryptoAddress } from '@prisma/client'
import { prismaClient } from '@/utils/server/prismaClient'
import { ACTION_NFT_SLUG, claimNFT } from '@/utils/server/nft/claimNFT'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('mintPastActions')

export async function mintPastActions(userId: string, userCryptoAddress: UserCryptoAddress) {
  logger.info('Triggered')
  const actionWithNFT = (Object.keys(ACTION_NFT_SLUG) as Array<UserActionType>).filter(
    key => ACTION_NFT_SLUG[key] !== null,
  )

  const actions = await prismaClient.userAction.findMany({
    where: {
      userId: userId,
      actionType: { in: actionWithNFT },
    },
  })

  for (const action of actions) {
    logger.info('mint past actions:' + action.actionType)
    await claimNFT(action, userCryptoAddress)
  }
}
