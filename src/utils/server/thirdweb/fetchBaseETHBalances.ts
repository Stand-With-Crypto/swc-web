import { formatEther } from 'viem'

import { thirdwebBaseRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClients'

type BaseETHBalance = {
  walletAddress: string
  displayValue: string
}

export async function fetchBaseETHBalances(walletAddresses: string[]) {
  const results: BaseETHBalance[] = []
  for (const address of walletAddresses) {
    const formattedAddress = address.toLowerCase().replace(/^0x/, '')
    results.push(
      await thirdwebBaseRPCClient
        .getBalance({
          address: `0x${formattedAddress}`,
        })
        .then(result => {
          return {
            walletAddress: address,
            displayValue: formatEther(result),
          }
        }),
    )
  }
  return results
}
