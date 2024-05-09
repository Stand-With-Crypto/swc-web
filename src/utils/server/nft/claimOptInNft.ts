import { UserActionOptInType, UserActionType, UserCryptoAddress } from '@prisma/client'

import { claimNFT } from '@/utils/server/nft/claimNFT'
import { prismaClient } from '@/utils/server/prismaClient'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns'

export async function claimOptInNFTIfUserDidNotClaimIt(user: {
  id: string
  primaryUserCryptoAddress: UserCryptoAddress | null
}) {
  if (!user.primaryUserCryptoAddress) {
    return
  }

  const optInUserAction = await getOptInUserAction(user.id)
  if (optInUserAction.nftMintId !== null) return

  await claimNFT(optInUserAction, user.primaryUserCryptoAddress)
}

export async function getOptInUserAction(userId: string) {
  const optInUserAction = await prismaClient.userAction.findFirst({
    where: {
      userId,
      campaignName: UserActionOptInCampaignName.DEFAULT,
      actionType: UserActionType.OPT_IN,
      userActionOptIn: {
        optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
      },
    },
  })

  if (!optInUserAction) {
    throw new Error(`Opt in user action don't exist`)
  }

  return optInUserAction
}
