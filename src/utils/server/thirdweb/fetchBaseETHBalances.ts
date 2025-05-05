import { formatEther } from 'viem'

import { thirdwebBaseRPCClient } from '@/utils/server/thirdweb/thirdwebRPCClients'

interface BaseETHBalance {
  walletAddress: string
  ethValue: number
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
          const value = Number(formatEther(result))
          if (isNaN(value) || value < 0) {
            throw new Error(`Invalid balance for ${address}: ${value}`)
          }
          return {
            walletAddress: address,
            ethValue: value,
          }
        }),
    )
  }
  return results
}
