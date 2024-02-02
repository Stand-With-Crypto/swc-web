import { prismaClient } from '@/utils/server/prismaClient'
import { NFTCurrency, NFTMintStatus } from '@prisma/client'
import { getLogger } from '@/utils/shared/logger'
import { ThirdwebTransactionStatus } from '@/utils/server/thirdweb/engineGetMintStatus'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'

const logger = getLogger('updateMintNFTStatus')

export const THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS: Record<
  ThirdwebTransactionStatus,
  NFTMintStatus
> = {
  mined: NFTMintStatus.CLAIMED,
  cancelled: NFTMintStatus.FAILED,
  errored: NFTMintStatus.FAILED,
}

export async function updateMintNFTStatus(
  mintNftId: string,
  nftMintStatus: NFTMintStatus,
  transactionHash: string | null,
  gasPrice: string | null,
) {
  logger.info('Triggered')

  const costAtMint = gasPrice ? +gasPrice * 0.000000001 : 0.0
  let costAtMintUsd = 0.0
  if (costAtMint > 0) {
    await getCryptoToFiatConversion(NFTCurrency.ETH)
      .then(res => {
        const ratio = res?.data.amount ? +res?.data.amount : 0.0
        costAtMintUsd = costAtMint * ratio
      })
      .catch(e => {
        logger.error(e)
      })
  }

  await prismaClient.nFTMint.update({
    where: {
      id: mintNftId,
    },
    data: {
      status: nftMintStatus,
      transactionHash: transactionHash ? transactionHash : '',
      costAtMint: costAtMint,
      costAtMintUsd: costAtMintUsd,
    },
  })
}
