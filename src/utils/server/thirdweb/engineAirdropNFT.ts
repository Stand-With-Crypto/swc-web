import * as Sentry from '@sentry/nextjs'

import {
  CHAIN_ID,
  THIRDWEB_BACKEND_WALLET,
  thirdwebEngine,
} from '@/utils/server/thirdweb/thirdwebEngine'
import { getLogger } from '@/utils/shared/logger'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`engineAirdropNFT`)

export async function engineAirdropNFT(
  contractAddress: string,
  walletAddress: string,
  quantity: number,
) {
  logger.info('Triggered')
  try {
    if (NEXT_PUBLIC_ENVIRONMENT === 'local' && !process.env.TRIGGER_AIRDROPS_ON_LOCAL) {
      logger.info(
        "Skipping airdrop on local environment. If you'd like to trigger airdrops on local, set TRIGGER_AIRDROPS_ON_LOCAL=true in your .env file.",
      )
      return 'local'
    }
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
