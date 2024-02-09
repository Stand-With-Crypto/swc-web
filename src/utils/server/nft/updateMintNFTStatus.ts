import { prismaClient } from '@/utils/server/prismaClient'
import { NFTCurrency, NFTMintStatus } from '@prisma/client'
import { getLogger } from '@/utils/shared/logger'
import { ThirdwebTransactionStatus } from '@/utils/server/thirdweb/engineGetMintStatus'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { Decimal } from '@prisma/client/runtime/library'

const logger = getLogger('updateMintNFTStatus')

export const THIRDWEB_TRANSACTION_STATUS_TO_NFT_MINT_STATUS: Record<
  ThirdwebTransactionStatus,
  NFTMintStatus
> = {
  cancelled: NFTMintStatus.FAILED,
  errored: NFTMintStatus.FAILED,
  mined: NFTMintStatus.CLAIMED,
  queued: NFTMintStatus.REQUESTED,
  retried: NFTMintStatus.REQUESTED,
  sent: NFTMintStatus.REQUESTED,
}

export async function updateMintNFTStatus(
  mintNftId: string,
  nftMintStatus: NFTMintStatus,
  transactionHash: string | null,
  gasPrice: string | null,
) {
  logger.info('Triggered')

  logger.info(gasPrice)
  const costAtMint = gasPrice ? new Decimal(+gasPrice * 1e-9) : new Decimal(0.0)
  let costAtMintUsd = new Decimal(0)
  let ratio = new Decimal(0)
  if (costAtMint.greaterThan(0.0)) {
    ratio = await getCryptoToFiatConversion(NFTCurrency.ETH)
      .then(res => {
        return res?.data.amount ? res?.data.amount : new Decimal(0)
      })
      .catch(e => {
        logger.error(e)
        return new Decimal(0)
      })

    costAtMintUsd = costAtMint.mul(ratio)
  }

  return prismaClient.nFTMint.update({
    data: {
      costAtMint: costAtMint,
      costAtMintUsd: costAtMintUsd,
      status: nftMintStatus,
      transactionHash: transactionHash,
    },
    where: {
      id: mintNftId,
    },
  })
}
