import { prismaClient } from '@/utils/server/prismaClient'
import { $Enums, NFTCurrency, UserAction, UserActionType, UserCryptoAddress } from '@prisma/client'

import { getLogger } from '@/utils/shared/logger'
import NFTMintStatus = $Enums.NFTMintStatus
import { inngest } from '@/inngest/inngest'
import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT'
import { airdropPayload } from '@/utils/server/nft/payload'
import { ACTION_NFT_SLUG, NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/contractAddress'

const USER_ACTION_WITH_NFT = [UserActionType.OPT_IN, UserActionType.CALL]

const logger = getLogger(`airdrop`)

export async function claimNFT(userAction: UserAction, userCryptoAddress: UserCryptoAddress) {
  logger.info('Triggered')
  const nftSlug = ACTION_NFT_SLUG[userAction.actionType]
  if (nftSlug === null) {
    return
  }

  if (await userAlreadyClaimedNFT(userAction.userId, nftSlug)) {
    logger.info('nft already requested or claimed')
    return
  }

  const userMintAction = await prismaClient.userAction.create({
    data: {
      user: { connect: { id: userAction.userId } },
      actionType: UserActionType.NFT_MINT,
      userCryptoAddress: { connect: { id: userCryptoAddress.id } },
      campaignName: userAction.campaignName,
      nftMint: {
        create: {
          nftSlug: nftSlug,
          status: NFTMintStatus.REQUESTED,
          costAtMint: 0.0,
          contractAddress: NFT_CONTRACT_ADDRESS[nftSlug],
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

  const payload: airdropPayload = {
    nftMintId: userMintAction.nftMint!.id,
    recipientWalletAddress: userCryptoAddress.cryptoAddress,
    contractAddress: NFT_CONTRACT_ADDRESS[nftSlug],
  }

  await inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: payload,
  })
}

async function userAlreadyClaimedNFT(userId: string, nftSlug: string) {
  const userActions = await prismaClient.userAction.findFirst({
    where: {
      userId: userId,
      nftMint: {
        nftSlug: nftSlug,
        status: { in: [NFTMintStatus.CLAIMED, NFTMintStatus.REQUESTED] },
      },
    },
  })
  return userActions !== null
}

export async function updateMinNFTStatus(
  mintNftId: string,
  nftMintStatus: NFTMintStatus,
  transactionHash: string,
) {
  await prismaClient.nFTMint.update({
    where: {
      id: mintNftId,
    },
    data: {
      status: nftMintStatus,
      transactionHash: transactionHash,
    },
  })
}

export async function mintPastActions(userId: string, userCryptoAddress: UserCryptoAddress) {
  for (const actionType of USER_ACTION_WITH_NFT) {
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
