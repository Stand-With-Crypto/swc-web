import { createAuth } from 'thirdweb/auth'
import { privateKeyToAccount } from 'thirdweb/wallets'

import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/thirdweb'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdwebAuth = createAuth({
  domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || '',
  adminAccount: privateKeyToAccount({
    client: thirdwebClient,
    privateKey: THIRDWEB_AUTH_PRIVATE_KEY,
  }),
  jwt: {
    expirationTimeSeconds: 60 * 60 * 24 * 7, // 1 week
  },
  client: thirdwebClient,
})
