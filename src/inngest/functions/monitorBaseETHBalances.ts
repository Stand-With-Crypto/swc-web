import * as Sentry from '@sentry/nextjs'
import { FailureEventArgs } from 'inngest'

import { inngest } from '@/inngest/inngest'
import { getBaseETHBalances } from '@/utils/server/basescan/getBaseETHBalances'
import { prettyLog } from '@/utils/shared/prettyLog'

export const MONITOR_BASE_ETH_BALANCES_INNGEST_FUNCTION_ID = 'monitor-base-eth-balances'
const MONITOR_BASE_ETH_BALANCES_INNGEST_RETRY_LIMIT = 5

const CRYPTO_ADDRESSES = [
  '0xc2A6116e9a1f9aDD1Bb87EEF308f216Bb0304c38',
  '0x4B0e6c1f66cA950B22e9Eaa8f075F0944a705B03',
]

const LOW_ETH_BALANCE_THRESHOLD = Number(process.env.LOW_ETH_BALANCE_THRESHOLD) ?? 0.25

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
  async ({ step }) => {
    const baseETHBalances = await step.run(
      'monitor-base-eth-balances.get-base-eth-balances',
      async () => {
        return await getBaseETHBalances(CRYPTO_ADDRESSES)
      },
    )

    for (const cryptoAddress of baseETHBalances.result) {
      // Divide by 10^18 to get the balance in ETH.
      const ethBalance = Number(cryptoAddress.balance) / 10 ** 18
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

    return
  },
)
