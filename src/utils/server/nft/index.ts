import { prismaClient } from '@/utils/server/prismaClient'
import { $Enums, NFTCurrency, UserAction, UserActionType } from '@prisma/client'
import {
  CallYourRepresentativeSept11ThirdWebNFT,
  NFTInformation,
  SWCShieldThirdWebNFT,
} from '@/utils/server/airdrop/nfts'
import { getLogger } from '@/utils/shared/logger'
import NFTMintStatus = $Enums.NFTMintStatus
import { inngest } from '@/inngest/inngest'
import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT'

const actionTypeNFTMapping: { [key: string]: NFTInformation } = {}
actionTypeNFTMapping[UserActionType.OPT_IN] = SWCShieldThirdWebNFT
actionTypeNFTMapping[UserActionType.CALL] = CallYourRepresentativeSept11ThirdWebNFT

const logger = getLogger(`airdrop`)

export async function claimNFT(userAction: UserAction, walletAddress: string) {
  logger.info('Triggered')
  const nft = actionTypeNFTMapping[userAction.actionType]
  if (nft === null) {
    return
  }

  logger.info('nft found')
  if (await userAlreadyClaimedNFT(userAction.userId, nft.slug)) {
    return
  }

  const userMintAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: userAction.userId } },
      actionType: UserActionType.NFT_MINT,
      userCryptoAddress: { connect: { id: userAction.userCryptoAddressId! } },
      campaignName: userAction.campaignName,
      nftMint: {
        create: {
          nftSlug: nft.slug,
          status: NFTMintStatus.REQUESTED,
          costAtMint: 0.0,
          contractAddress: nft.contractAddress,
          costAtMintCurrencyCode: NFTCurrency.ETH,
          transactionHash: '',
          costAtMintUsd: '0',
        },
      },
    },
    include: {
      nftMint: true,
    },
  })

  await inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: {
      userAction: userMintAction,
      walletAddress: walletAddress,
    },
  })
}

async function userAlreadyClaimedNFT(userId: string, nftSlug: string) {
  logger.info('userAlreadyClaimedNFT triggered')
  const userActions = await prismaClient.user.findFirst({
    where: {
      id: userId,
      userActions: {
        every: {
          nftMint: {
            nftSlug: nftSlug,
          },
        },
      },
    },
  })
  logger.info(userActions)
  return userActions !== null
}
