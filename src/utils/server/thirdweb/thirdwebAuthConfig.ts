import { ThirdwebAuthConfig } from '@thirdweb-dev/auth/next'
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import { prismaClient } from '@/utils/server/prismaClient'
import { getUserSessionIdOnPageRouter } from '@/utils/server/serverUserSessionId'
import { getServerAnalytics, getServerPeopleAnalytics } from '@/utils/server/serverAnalytics'
import {
  mapLocalUserToUserDatabaseFields,
  parseLocalUserFromCookiesForPageRouter,
} from '@/utils/server/serverLocalUser'
import { mapPersistedLocalUserToAnalyticsProperties } from '@/utils/shared/localUser'
import { UserEmailAddressSource } from '@prisma/client'
import { fetchEmbeddedWalletMetadataFromThirdweb } from '@/utils/server/thirdweb/fetchEmbeddedWalletMetadataFromThirdweb'

// TODO migrate this logic from page router to app router once thirdweb supports it

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdwebAuthConfig: ThirdwebAuthConfig = {
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
    onUser: async () => {},
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
      if (existingUser) {
        return { userId: existingUser.id }
      }
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
        include: { user: true },
      })
      const embeddedWalletEmailAddress = await fetchEmbeddedWalletMetadataFromThirdweb(address)
      let primaryUserEmailAddressId: null | string = null
      /*
        If the authenticated crypto address came from a thirdweb embedded wallet, we want to create a user email address
        and link it to the wallet so we know it's an embedded address
        */
      if (embeddedWalletEmailAddress) {
        let email = await prismaClient.userEmailAddress.findFirst({
          where: {
            emailAddress: embeddedWalletEmailAddress.email.toLowerCase(),
            userId: userCryptoAddress.userId,
          },
        })
        if (!email) {
          email = await prismaClient.userEmailAddress.create({
            data: {
              isVerified: true,
              source: UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH,
              emailAddress: embeddedWalletEmailAddress.email.toLowerCase(),
              userId: userCryptoAddress.userId,
            },
          })
          if (!userCryptoAddress.user.primaryUserEmailAddressId) {
            primaryUserEmailAddressId = email.id
          }
        }
        if (!userCryptoAddress.user.primaryUserEmailAddressId) {
          primaryUserEmailAddressId = email.id
        }
        await prismaClient.userCryptoAddress.update({
          where: { id: userCryptoAddress.id },
          data: {
            embeddedWalletUserEmailAddressId: email.id,
          },
        })
      }
      await prismaClient.user.update({
        where: { id: userCryptoAddress.userId },
        data: {
          primaryUserCryptoAddressId: userCryptoAddress.id,
          ...(primaryUserEmailAddressId ? { primaryUserEmailAddressId } : {}),
        },
      })
      return { userId: userCryptoAddress.userId }
    },
  },
}
