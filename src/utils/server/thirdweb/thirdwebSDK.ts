import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

const THIRDWEB_AUTH_SECRET_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_SECRET_KEY,
  'THIRDWEB_AUTH_SECRET_KEY',
)

export const thirdwebSDK = ThirdwebSDK.fromPrivateKey(THIRDWEB_AUTH_PRIVATE_KEY, 'base', {
  secretKey: THIRDWEB_AUTH_SECRET_KEY,
})
