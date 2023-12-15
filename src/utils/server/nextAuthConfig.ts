import { prismaClient } from '@/utils/server/prismaClient'
import { ThirdwebAuthProvider, authSession } from '@thirdweb-dev/auth/next-auth'
import { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { requiredEnv } from '@/utils/shared/requiredEnv'

export const nextAuthConfig: AuthOptions = {
  adapter: PrismaAdapter(prismaClient),
  providers: [
    // Add the thirdweb auth provider to the providers configuration
    ThirdwebAuthProvider({
      domain: requiredEnv(
        process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
        'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
      ),
    }),
    // other providers...
  ],
  callbacks: {
    // Add the authSession callback to the callbacks configuration
    session: authSession,
  },
}
