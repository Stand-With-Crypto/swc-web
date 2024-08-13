import { createThirdwebClient } from 'thirdweb'
import { viemAdapter } from 'thirdweb/adapters/viem'
import { base } from 'thirdweb/chains'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { THIRD_WEB_CLIENT_SECRET } from '@/utils/server/thirdweb/thirdwebClientSecret'

export const thirdwebRPCClient = createPublicClient({
  chain: mainnet,
  transport: http('https://ethereum.rpc.thirdweb.com', {
    batch: {
      wait: 100,
    },
    fetchOptions: {
      headers: { 'x-secret-key': THIRD_WEB_CLIENT_SECRET },
    },
  }),
})

export const thirdwebServerClient = createThirdwebClient({
  secretKey: THIRD_WEB_CLIENT_SECRET,
})

export const thirdwebBaseRPCClient = viemAdapter.publicClient.toViem({
  client: thirdwebServerClient,
  chain: base,
})
