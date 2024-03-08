import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs, NonRetriableError } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { getBaseETHBalances } from '@/utils/server/basescan/getBaseETHBalances'
import { LEGACY_NFT_DEPLOYER_WALLET, SWC_DOT_ETH_WALLET } from '@/utils/server/nft/constants'
import { prettyLog } from '@/utils/shared/prettyLog'

export const MONITOR_BASE_ETH_BALANCES_INNGEST_FUNCTION_ID = 'monitor-base-eth-balances'
const MONITOR_BASE_ETH_BALANCES_INNGEST_RETRY_LIMIT = 5

const ETH_BASE_UNIT_WEI = 10 ** 18

const LOW_ETH_BALANCE_THRESHOLD = Number(process.env.LOW_ETH_BALANCE_THRESHOLD) || 0.25

export async function onFailureMonitorBaseETHBalances(failureEventArgs: FailureEventArgs) {
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
  { cron: '*/10 * * * *' }, // Every 10 minutes.
  async () => {
    try {
      const baseETHBalances = await getBaseETHBalances([
        SWC_DOT_ETH_WALLET,
        LEGACY_NFT_DEPLOYER_WALLET,
      ])
      for (const cryptoAddress of baseETHBalances.result) {
        // Divide by 10^18 to get the balance in ETH.
        const ethBalance = Number(cryptoAddress.balance) / ETH_BASE_UNIT_WEI
        prettyLog(`Base ETH balance for ${cryptoAddress.account} - ${ethBalance} ETH`)
        if (ethBalance < LOW_ETH_BALANCE_THRESHOLD) {
          // Trigger Sentry alert.
          Sentry.captureMessage(
            `Low Base ETH balance detected for ${cryptoAddress.account} - ${ethBalance} ETH. Please fund as soon as possible.`,
            {
              level: 'error',
              extra: { basescanLink: `https://basescan.org/address/${cryptoAddress.account}` },
            },
          )
        }
      }
    } catch (error) {
      throw new NonRetriableError('experienced error when fetching Base ETH balances', {
        cause: error,
      })
    }

    return
  },
)
