import { User, UserCryptoAddress } from '@prisma/client'

import { ACTION_NFT_SLUG, claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { ServerLocalUser } from '@/utils/server/serverLocalUser'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('mintPastActions')

export async function mintPastActions(
  user: User,
  userCryptoAddress: UserCryptoAddress,
  localUser: ServerLocalUser | null,
) {
  logger.info('Triggered')

  const actions = await prismaClient.userAction.findMany({
    where: {
      userId: user.id,
      nftMintId: null,
    },
  })

  const analytics = getServerAnalytics({ userId: user.id, localUser })
  for (const action of actions) {
    const nftSlug = ACTION_NFT_SLUG[action.actionType]?.[action.campaignName]
    if (!nftSlug) {
      logger.info(
        `no nft for action type ${action.actionType}, campaignName ${action.campaignName}`,
      )
      continue
    }
    logger.info('mint past actions:' + action.actionType)
    analytics.track('NFT Mint Backfill Triggered', {
      'User Action Type': action.actionType,
      'User Action Id': action.id,
    })

    const signUpFlowExperimentVariant =
      localUser?.persisted?.experiments?.gh02_SWCSignUpFlowExperiment
    if (action.actionType === 'OPT_IN' && signUpFlowExperimentVariant === 'variant') {
      continue
    }

    await claimNFT(action, userCryptoAddress)
  }

  await analytics.flush()
  return actions
}
