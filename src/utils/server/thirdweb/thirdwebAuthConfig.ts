import { ThirdwebAuthConfig } from '@thirdweb-dev/auth/next'
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm'
import Cookies from 'js-cookie'

import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import { prismaClient } from '@/utils/server/prismaClient'
import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookiesForPageRouter } from '@/utils/server/serverLocalUser'
import { onLogin } from '@/utils/server/thirdweb/onLogin'
import { AuthSessionMetadata } from '@/utils/server/thirdweb/types'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'

// LATER-TASK migrate this logic from page router to app router once thirdweb supports it

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdwebAuthConfig: ThirdwebAuthConfig = {
  domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  // TODO determine if we have requirements for the wallet private key that necessitate a more secure storage mechanism
  wallet: new PrivateKeyWallet(THIRDWEB_AUTH_PRIVATE_KEY),
  authOptions: {
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
    onLogout: (user, req) => {
      const localUser = parseLocalUserFromCookiesForPageRouter(req)
      const sessionData = user.session as AuthSessionMetadata
      getServerAnalytics({ userId: sessionData.userId, localUser }).track('User Logged Out')
      Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId())
    },
    // look for the comment in appRouterGetAuthUser for why we don't use this fn
    onUser: async () => {},
    onLogin,
  },
}
