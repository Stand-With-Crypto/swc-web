import { createPublicClient, http } from 'viem'
import { base, mainnet } from 'viem/chains'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const THIRD_WEB_CLIENT_SECRET = requiredEnv(
  process.env.THIRD_WEB_CLIENT_SECRET,
  'THIRD_WEB_CLIENT_SECRET',
)

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
