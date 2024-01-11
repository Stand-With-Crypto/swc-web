import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'

export const wagmiClientConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})
