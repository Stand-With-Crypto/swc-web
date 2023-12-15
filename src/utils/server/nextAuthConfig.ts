import { prismaClient } from '@/utils/server/prismaClient'
import { ThirdwebAuthProvider, authSession } from '@thirdweb-dev/auth/next-auth'
import { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { requiredEnv } from '@/utils/shared/requiredEnv'

export const nextAuthConfig: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [
    ThirdwebAuthProvider({
      domain: requiredEnv(
        process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
        'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
      ),
    }),
  ],
  callbacks: {
    session: authSession,
  },
  session: {
    // TODO determine how we can ensure we persist users to the prisma table while leveraging a jwt strategy
    strategy: 'jwt',
  },
  logger: {
    error(...args) {
      console.log('nextAuth error', ...args)
    },
    warn(...args) {
      console.log('nextAuth error', ...args)
    },
    debug(...args) {
      console.log('nextAuth error', ...args)
    },
  },
}
