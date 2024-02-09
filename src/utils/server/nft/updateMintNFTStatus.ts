import { NFTCurrency, NFTMintStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

import { prismaClient } from '@/utils/server/prismaClient'
import { ThirdwebTransactionStatus } from '@/utils/server/thirdweb/engineGetMintStatus'
import { getCryptoToFiatConversion } from '@/utils/shared/getCryptoToFiatConversion'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('updateMintNFTStatus')

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
    where: {
      id: mintNftId,
    },
    data: {
      status: nftMintStatus,
      transactionHash: transactionHash,
      costAtMint: costAtMint,
      costAtMintUsd: costAtMintUsd,
    },
  })
}
