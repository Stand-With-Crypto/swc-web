import { prismaClient } from '@/utils/server/prismaClient'
import { NFTMintStatus } from '@prisma/client'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('updateMintNFTStatus')

export async function updateMintNFTStatus(
  mintNftId: string,
  nftMintStatus: NFTMintStatus,
  transactionHash: string | null,
) {
  logger.info('Triggered')
  await prismaClient.nFTMint.update({
    where: {
      id: mintNftId,
    },
    data: {
      status: nftMintStatus,
      transactionHash: transactionHash ? transactionHash : '',
    },
  })
}
