import * as Sentry from '@sentry/nextjs'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const BASESCAN_API_KEY = requiredEnv(process.env.BASESCAN_API_KEY, 'process.env.BASESCAN_API_KEY')

type GetBaseETHBalancesResponse = {
  status: string
  message: string
  result: Array<{
    account: string
    balance: string
  }>
}

/**
 * Returns the wei balance of the given Ethereum addresses.
 *
 * @param cryptoAddresses
 * @returns
 */
export async function getBaseETHBalances(cryptoAddresses: string[]) {
  const url = `https://api.basescan.org/api?module=account&action=balancemulti&tag=latest&address=${cryptoAddresses.toString()}&apikey=${BASESCAN_API_KEY}`
  try {
    const httpResp = await fetchReq(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return (await httpResp.json()) as GetBaseETHBalancesResponse
  } catch (error) {
    Sentry.captureException(error, {
      tags: { domain: 'getBaseETHBalances' },
      extra: { url },
    })
    throw error
  }
}
