import { Engine } from '@thirdweb-dev/engine'

import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'

const THIRDWEB_ENGINE_URL = requiredOutsideLocalEnv(
  process.env.THIRDWEB_ENGINE_URL,
  'THIRDWEB_ENGINE_URL',
  'NFT airdrop',
)!

const THIRDWEB_ENGINE_ACCESS_TOKEN = requiredOutsideLocalEnv(
  process.env.THIRDWEB_ENGINE_ACCESS_TOKEN,
  'THIRDWEB_ENGINE_ACCESS_TOKEN',
  'NFT airdrop',
)!

export const CHAIN_ID = 'base'

export const thirdwebEngine = new Engine({
  url: THIRDWEB_ENGINE_URL,
  accessToken: THIRDWEB_ENGINE_ACCESS_TOKEN,
})
