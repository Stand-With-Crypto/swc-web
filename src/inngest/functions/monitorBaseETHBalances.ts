import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs, NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { LEGACY_NFT_DEPLOYER_WALLET, SWC_DOT_ETH_WALLET } from '@/utils/server/nft/constants'
import { fetchBaseETHBalances } from '@/utils/server/thirdweb/fetchBaseETHBalances'
import { prettyLog } from '@/utils/shared/prettyLog'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const MONITOR_BASE_ETH_BALANCES_INNGEST_FUNCTION_ID = 'monitor-base-eth-balances'
const MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_NAME = 'monitor.base.eth.balances'
const MONITOR_BASE_ETH_BALANCES_INNGEST_RETRY_LIMIT = 5

const LOW_ETH_BALANCE_THRESHOLD = Number(process.env.LOW_ETH_BALANCE_THRESHOLD) || 0.25

async function onFailureMonitorBaseETHBalances(failureEventArgs: FailureEventArgs) {
  Sentry.captureException(failureEventArgs.error, {
    level: 'error',
    tags: {
      functionId: failureEventArgs.event.data.function_id,
    },
  })
}

export const monitorBaseETHBalances = inngest.createFunction(
  {
    id: MONITOR_BASE_ETH_BALANCES_INNGEST_FUNCTION_ID,
    retries: MONITOR_BASE_ETH_BALANCES_INNGEST_RETRY_LIMIT,
    onFailure: onFailureMonitorBaseETHBalances,
  },
  {
    ...(NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? { cron: '*/10 * * * *' }
      : { event: MONITOR_BASE_ETH_BALANCES_INNGEST_EVENT_NAME }),
  }, // Every 10 minutes.
  async () => {
    try {
      const baseETHBalances = await fetchBaseETHBalances([
        SWC_DOT_ETH_WALLET,
        LEGACY_NFT_DEPLOYER_WALLET,
      ])
      for (const balance of baseETHBalances) {
        prettyLog(`Base ETH balance for ${balance.walletAddress} - ${balance.ethValue} ETH`)
        if (balance.ethValue < LOW_ETH_BALANCE_THRESHOLD) {
          // Trigger Sentry alert.
          Sentry.captureMessage(
            `Low Base ETH balance detected for ${balance.walletAddress} - ${balance.ethValue} ETH. Please fund as soon as possible.`,
            {
              level: 'error',
              extra: { basescanLink: `https://basescan.org/address/${balance.walletAddress}` },
            },
          )
        }
      }
      return baseETHBalances
    } catch (error) {
      throw new NonRetriableError('experienced error when fetching Base ETH balances', {
        cause: error,
      })
    }
  },
)
