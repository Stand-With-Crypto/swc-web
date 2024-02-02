import { prismaClient } from '@/utils/server/prismaClient'
import { $Enums, NFTCurrency, UserAction, UserActionType, UserCryptoAddress } from '@prisma/client'
import { getLogger } from '@/utils/shared/logger'
import { inngest } from '@/inngest/inngest'
import { AIRDROP_NFT_INNGEST_EVENT_NAME } from '@/inngest/functions/airdropNFT'
import { airdropPayload } from '@/utils/server/nft/payload'
import { NFT_CONTRACT_ADDRESS } from '@/utils/server/nft/contractAddress'
import { NFTSlug } from '@/utils/shared/nft'
import NFTMintStatus = $Enums.NFTMintStatus

export const ACTION_NFT_SLUG: Record<UserActionType, NFTSlug | null> = {
  [UserActionType.OPT_IN]: NFTSlug.SWC_SHIELD,
  [UserActionType.CALL]: NFTSlug.CALL_REPRESENTATIVE_SEPT_11,
  [UserActionType.EMAIL]: null,
  [UserActionType.DONATION]: null,
  [UserActionType.NFT_MINT]: null,
  [UserActionType.TWEET]: null,
}

const logger = getLogger('claimNft')

export async function claimNFT(userAction: UserAction, userCryptoAddress: UserCryptoAddress) {
  logger.info('Triggered')
  const nftSlug = ACTION_NFT_SLUG[userAction.actionType]
  if (nftSlug === null) {
    return
  }

  const nftMint = await prismaClient.nFTMint.create({
    data: {
      nftSlug: nftSlug,
      status: NFTMintStatus.REQUESTED,
      costAtMint: 0.0,
      contractAddress: NFT_CONTRACT_ADDRESS[nftSlug],
      costAtMintCurrencyCode: NFTCurrency.ETH,
      transactionHash: '',
      costAtMintUsd: '0',
    },
  })

  await prismaClient.userAction.update({
    where: { id: userAction.id },
    data: {
      nftMintId: nftMint.id,
    },
    include: {
      nftMint: true,
    },
  })

  const payload: airdropPayload = {
    nftMintId: nftMint.id,
    recipientWalletAddress: userCryptoAddress.cryptoAddress,
    contractAddress: NFT_CONTRACT_ADDRESS[nftSlug],
  }

  await inngest.send({
    name: AIRDROP_NFT_INNGEST_EVENT_NAME,
    data: payload,
  })
}
