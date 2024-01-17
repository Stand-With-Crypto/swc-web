import { ThirdwebAuth, ThirdwebAuthConfig } from '@thirdweb-dev/auth/next'
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import { SupportedUserCryptoNetwork } from '@prisma/client'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookiesForPageRouter,
} from '@/utils/server/serverLocalUser'
import {
  mapCurrentSessionLocalUserToAnalyticsProperties,
  mapPersistedLocalUserToAnalyticsProperties,
} from '@/utils/shared/localUser'

// TODO migrate this logic from page router to app router once thirdweb supports it

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdWebAuthConfig: ThirdwebAuthConfig = {
  domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  // TODO determine if we have requirements for the wallet private key that necessitate a more secure storage mechanism
  wallet: new PrivateKeyWallet(THIRDWEB_AUTH_PRIVATE_KEY),
  authOptions: {
    // TODO determine what IT security wants to do here
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
      getServerAnalytics({ address: user.address, localUser }).track('User Logged Out')
      // TODO analytics
    },
    // look for the comment in appRouterGetAuthUser for why we don't use this fn
    onUser: async (user, req) => {},
    onLogin: async (address, req) => {
      const localUser = parseLocalUserFromCookiesForPageRouter(req)
      // TODO figure out how to get the users email address to persist to the db
      let existingUser = await prismaClient.user.findFirst({
        where: { userCryptoAddresses: { some: { cryptoAddress: address } } },
      })
      getServerAnalytics({ address, localUser }).track('User Logged In', {
        'Is First Time': !existingUser,
      })
      const peopleAnalytics = getServerPeopleAnalytics({ address, localUser })
      peopleAnalytics.set({ 'Datetime of Last Login': new Date() })
      if (!existingUser) {
        const userSessionId = getUserSessionIdOnPageRouter(req)
        existingUser = await prismaClient.user.findFirst({
          where: { userSessions: { some: { id: userSessionId } } },
        })
        if (localUser) {
          peopleAnalytics.setOnce(mapPersistedLocalUserToAnalyticsProperties(localUser.persisted))
        }
        const userCryptoAddress = await prismaClient.userCryptoAddress.create({
          data: {
            cryptoAddress: address,
            user: existingUser
              ? { connect: { id: existingUser.id } }
              : {
                  create: {
                    isPubliclyVisible: false,
                    ...mapLocalUserToUserDatabaseFields(localUser),
                  },
                },
          },
        })
        await prismaClient.user.update({
          where: { id: userCryptoAddress.userId },
          data: { primaryUserCryptoAddressId: userCryptoAddress.id },
        })
      }
    },
  },
}
export const thirdWebAuth = ThirdwebAuth(thirdWebAuthConfig)
