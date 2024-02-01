import {
  CHAIN_ID,
  THIRDWEB_BACKEND_WALLET,
  thirdwebEngine,
} from '@/utils/server/thirdweb/thirdwebEngine'
import { getLogger } from '@/utils/shared/logger'
import * as Sentry from '@sentry/nextjs'

const logger = getLogger(`ThirdWebAirdrop`)

export async function engineAirdropNFT(
  contractAddress: string,
  walletAddress: string,
  quantity: number,
) {
  logger.info('engine airdrop triggered')
  try {
    const result = await thirdwebEngine.erc721.claimTo(
      CHAIN_ID,
      contractAddress,
      THIRDWEB_BACKEND_WALLET,
      {
        receiver: walletAddress,
        quantity: quantity.toString(),
      },
    )
    return result.result.queueId
  } catch (e) {
    logger.error('error airdropping NFT:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'engineAirdropNFT' },
      extra: { contractAddress, walletAddress, quantity },
    })
    throw e
  }
}

export async function engineGetMintStatus(queryId: string) {
  logger.info('engine airdrop triggered')
  try {
    const result = await thirdwebEngine.transaction.status(queryId)

    return result.result
  } catch (e) {
    logger.error('error airdropping NFT:' + e)
    Sentry.captureException(e, {
      level: 'error',
      tags: { domain: 'engineGetMintStatus' },
      extra: { queryId },
    })
    throw e
  }
}
