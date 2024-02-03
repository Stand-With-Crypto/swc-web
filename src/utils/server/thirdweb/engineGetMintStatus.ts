import { thirdwebEngine } from '@/utils/server/thirdweb/thirdwebEngine'
import * as Sentry from '@sentry/nextjs'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger(`engineGetMintStatus`)

export type ThirdwebTransactionStatus = 'mined' | 'errored' | 'cancelled'

export const THIRDWEB_TRANSACTION_STATUSES: ThirdwebTransactionStatus[] = [
  'mined',
  'errored',
  'cancelled',
]

export async function engineGetMintStatus(queryId: string) {
  logger.info('Triggered')
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
