import { defineChain } from 'thirdweb'
import { base } from 'thirdweb/chains'
import { getWalletBalance } from 'thirdweb/wallets'

import { thirdwebRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClients'

type BaseETHBalance = {
  walletAddress: string
  displayValue: string
}

export async function fetchBaseETHBalances(walletAddresses: string[]) {
  const client = thirdwebRPCClient
  const chain = defineChain(base)
  const results: BaseETHBalance[] = []
  for (const address of walletAddresses) {
    results.push(
      await getWalletBalance({
        address,
        chain,
        client,
      }).then(result => {
        return {
          walletAddress: address,
          displayValue: result.displayValue,
        }
      }),
    )
  }
  return results
}
