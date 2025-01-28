import { createAuth } from 'thirdweb/auth'
import { privateKeyToAccount } from 'thirdweb/wallets'

import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/thirdweb'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const THIRDWEB_TOKEN_EXPIRATION_TIME_SECONDS = 60 * 60 * 24 * 7 // 1 week

export const thirdwebAdminAccount = privateKeyToAccount({
  client: thirdwebClient,
  privateKey: THIRDWEB_AUTH_PRIVATE_KEY,
})

export const thirdwebAuth = createAuth({
  domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || '',
  adminAccount: thirdwebAdminAccount,
  jwt: {
    expirationTimeSeconds: THIRDWEB_TOKEN_EXPIRATION_TIME_SECONDS,
  },
  client: thirdwebClient,
})
