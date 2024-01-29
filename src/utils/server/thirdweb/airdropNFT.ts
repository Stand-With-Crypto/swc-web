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
    logger.info('Got Contract')
    const preparedTx = await contract.erc721.claimTo.prepare(walletAddress, quantity)

    logger.info(preparedTx.getGasPrice())
    // const tx = await contract.erc721.claimTo(walletAddress, quantity, {})

    const tx = await preparedTx.execute()
    logger.info('Done')

    return tx[0].receipt.transactionHash
  } catch (e) {
    Sentry.captureException(e, {
      level: 'error',
    })
    throw e
  }
}
