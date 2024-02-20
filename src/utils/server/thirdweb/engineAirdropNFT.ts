import * as Sentry from '@sentry/nextjs'

import { NFT_SLUG_BACKEND_METADATA } from '@/utils/server/nft/constants'
import { CHAIN_ID, thirdwebEngine } from '@/utils/server/thirdweb/thirdwebEngine'
import { getLogger } from '@/utils/shared/logger'
import { NFTSlug } from '@/utils/shared/nft'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const logger = getLogger(`engineAirdropNFT`)

export async function engineAirdropNFT(nftSlug: NFTSlug, walletAddress: string, quantity: number) {
  logger.info('Triggered')
  const { contractAddress, associatedWallet } = NFT_SLUG_BACKEND_METADATA[nftSlug]
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
      associatedWallet,
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
      extra: { contractAddress, associatedWallet, walletAddress, quantity },
    })
    throw e
  }
}
