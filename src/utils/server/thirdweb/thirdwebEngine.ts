import { Engine } from '@thirdweb-dev/engine'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const THIRDWEB_ENGINE_URL = requiredEnv(process.env.THIRDWEB_ENGINE_URL, 'THIRDWEB_ENGINE_URL')

const THIRDWEB_ENGINE_ACCESS_TOKEN = requiredEnv(
  process.env.THIRDWEB_ENGINE_ACCESS_TOKEN,
  'THIRDWEB_ENGINE_ACCESS_TOKEN',
)

export const THIRDWEB_BACKEND_WALLET = requiredEnv(
  process.env.THIRDWEB_BACKEND_WALLET,
  'THIRDWEB_BACKEND_WALLET',
)

export const CHAIN_ID = 'base'

export const thirdwebEngine = new Engine({
  url: THIRDWEB_ENGINE_URL,
  accessToken: THIRDWEB_ENGINE_ACCESS_TOKEN,
})
