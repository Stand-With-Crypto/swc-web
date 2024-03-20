import { NFTMintStatus } from '@prisma/client'

import { prismaClient } from '@/utils/server/prismaClient'
import { ThirdwebTransactionStatus } from '@/utils/server/thirdweb/engineGetMintStatus'

export const THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS: Record<
  ThirdwebTransactionStatus,
  NFTMintStatus
> = {
  queued: NFTMintStatus.REQUESTED,
  retried: NFTMintStatus.REQUESTED,
  sent: NFTMintStatus.REQUESTED,
  mined: NFTMintStatus.CLAIMED,
  cancelled: NFTMintStatus.FAILED,
  errored: NFTMintStatus.FAILED,
}

export async function updateMintNFTStatus(
  mintNftId: string,
  nftMintStatus: NFTMintStatus,
  transactionHash: string | null,
) {
  return prismaClient.nFTMint.update({
    where: {
      id: mintNftId,
    },
    data: {
      status: nftMintStatus,
      transactionHash: transactionHash,
      costAtMint: 0,
      costAtMintUsd: 0,
    },
  })
}
