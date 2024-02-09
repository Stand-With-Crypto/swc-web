import {
  CHAIN_ID,
  THIRDWEB_BACKEND_WALLET,
  thirdwebEngine,
} from '@/utils/server/thirdweb/thirdwebEngine'
import { getLogger } from '@/utils/shared/logger'
import * as Sentry from '@sentry/nextjs'

const logger = getLogger(`engineAirdropNFT`)

export async function engineAirdropNFT(
  contractAddress: string,
  walletAddress: string,
  quantity: number,
) {
  logger.info('Triggered')
  try {
    const result = await thirdwebEngine.erc721.claimTo(
      CHAIN_ID,
      contractAddress,
      THIRDWEB_BACKEND_WALLET,
      {
        quantity: quantity.toString(),
        receiver: walletAddress,
      },
    )
    return result.result.queueId
  } catch (e) {
    logger.error('error airdropping NFT:' + e)
    Sentry.captureException(e, {
      extra: { contractAddress, quantity, walletAddress },
      level: 'error',
      tags: { domain: 'engineAirdropNFT' },
    })
    throw e
  }
}
