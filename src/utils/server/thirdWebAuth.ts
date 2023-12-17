import { ThirdwebAuth } from '@thirdweb-dev/auth/next'
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import { prismaClient } from '@/utils/server/prismaClient'
import { User } from '@prisma/client'

// TODO migrate this logic from page router to app router once thirdweb supports it

const THIRDWEB_AUTH_PRIVATE_KEY = requiredEnv(
  process.env.THIRDWEB_AUTH_PRIVATE_KEY,
  'THIRDWEB_AUTH_PRIVATE_KEY',
)

export const thirdWebAuth = ThirdwebAuth({
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
    onLogout: user => {
      // TODO analytics
    },
    onUser: async (user, req) => {
      // TODO analytics
      // TODO append metadata to the user session object
      // console.log('onUser', { user, req: !!req })
    },
    onLogin: async address => {
      // TODO figure out how to get the users email address to persist to the db
      console.log('onLogin', { address })
      // TODO analytics
      const existingUser = await prismaClient.cryptoAddressUser.findUnique({ where: { address } })
      if (!existingUser) {
        await prismaClient.cryptoAddressUser.create({
          // TODO try to match this with an existing user
          data: { address, inferredUser: { create: {} } },
        })
      }
    },
  },
})
