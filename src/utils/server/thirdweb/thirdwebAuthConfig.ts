import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm'
import { ThirdwebAuthConfig } from '@thirdweb-dev/auth/next'

import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookiesForPageRouter } from '@/utils/server/serverLocalUser'
import { onLogin } from '@/utils/server/thirdweb/onLogin'
import { AuthSessionMetadata } from '@/utils/server/thirdweb/types'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'

// LATER-TASK migrate this logic from page router to app router once thirdweb supports it

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdwebAuthConfig: ThirdwebAuthConfig = {
  domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  wallet: new PrivateKeyWallet(THIRDWEB_AUTH_PRIVATE_KEY),
  authOptions: {
    // statement: 'Hello World',
    tokenDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
    validateNonce: async (nonce: string) => {
      const nonceExists = await prismaClient.authenticationNonce.findUnique({
        where: { id: nonce },
      })

      if (nonceExists) {
        throw new Error('Nonce has already been used!')
      }

      await prismaClient.authenticationNonce.create({ data: { id: nonce } })
    },
  },
  callbacks: {
    onLogout: async (user, req) => {
      const localUser = parseLocalUserFromCookiesForPageRouter(req)
      const sessionData = user.session as AuthSessionMetadata
      await getServerAnalytics({ userId: sessionData.userId, localUser }).track('User Logged Out')
    },
    // look for the comment in appRouterGetAuthUser for why we don't use this fn
    onUser: async () => {},
    onLogin,
  },
}
