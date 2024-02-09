import { UserActionType, UserCryptoAddress } from '@prisma/client'
import { prismaClient } from '@/utils/server/prismaClient'
import { ACTION_NFT_SLUG, claimNFT } from '@/utils/server/nft/claimNFT'
import { getLogger } from '@/utils/shared/logger'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'

const logger = getLogger('mintPastActions')

export async function mintPastActions(
  userId: string,
  userCryptoAddress: UserCryptoAddress,
  localUser: ServerLocalUser | null,
) {
  logger.info('Triggered')
  const actionWithNFT = (Object.keys(ACTION_NFT_SLUG) as Array<UserActionType>).filter(
    key => ACTION_NFT_SLUG[key] !== null,
  )

  const actions = await prismaClient.userAction.findMany({
    where: {
      userId: userId,
      actionType: { in: actionWithNFT },
      nftMintId: null,
    },
  })

  for (const action of actions) {
    logger.info('mint past actions:' + action.actionType)
    getServerAnalytics({ userId: userId, localUser }).track('NFT Mint Backfill Triggered', {
      'User Action Type': action.actionType,
      'User Action Id': action.id,
    })
    await claimNFT(action, userCryptoAddress)
  }
}
