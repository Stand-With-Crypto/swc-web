import { createPublicClient, http } from 'viem'
import { base, mainnet } from 'viem/chains'

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

export const thirdwebBaseRPCClient = createPublicClient({
  chain: base,
  transport: http('https://base.rpc.thirdweb.com', {
    batch: {
      wait: 100,
    },
    fetchOptions: {
      headers: { 'x-secret-key': THIRD_WEB_CLIENT_SECRET },
    },
  }),
})
