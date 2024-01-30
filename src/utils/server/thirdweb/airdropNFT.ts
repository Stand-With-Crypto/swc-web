import { thirdwebSDK } from '@/utils/server/thirdweb/thirdwebSDK'
import { getLogger } from '@/utils/shared/logger'
import * as Sentry from '@sentry/nextjs'

const logger = getLogger(`ThirdWebAirdrop`)

export async function airdropNFT(
  contractAddresses: string,
  walletAddress: string,
  quantity: number,
) {
  logger.info('Triggered')

  try {
    const contract = await thirdwebSDK.getContract(contractAddresses)
    const tx = await contract.erc721.claimTo(walletAddress, quantity, {})
    return tx[0].receipt.transactionHash
  } catch (e) {
    logger.error('Failed to airdrop NFT')
    Sentry.captureException(e, {
      level: 'error',
    })
    throw e
  }
}
