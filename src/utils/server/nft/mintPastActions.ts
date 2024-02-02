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

  for (const actionType of actionWithNFT) {
    const action = await prismaClient.userAction.findFirst({
      where: {
        userId: userId,
        actionType: actionType,
      },
    })

    if (action !== null) {
      logger.info('mint past actions:' + action.actionType)
      await claimNFT(action, userCryptoAddress)
    }
  }
}
