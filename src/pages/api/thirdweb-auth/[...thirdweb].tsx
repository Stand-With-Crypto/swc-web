import { ThirdwebAuth } from '@thirdweb-dev/auth/next'
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm'
import { requiredEnv } from '@/utils/shared/requiredEnv'

// TODO determine if this is needed in addition to the next-auth provider

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  domain: 'example.com',
  wallet: new PrivateKeyWallet(THIRDWEB_AUTH_PRIVATE_KEY),
})

export default ThirdwebAuthHandler()
