'use client'
import { requiredEnv } from '@/utils/shared/requiredEnv'
// Because most pages that require authentication will mainly be composed of static content, we want to avoid returning session info from the server, and instead fetching/wrapping it on the client
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import { SessionProvider } from 'next-auth/react'

const NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
)
const NEXT_PUBLIC_THIRDWEB_CLIENT_ID = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  'process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
)

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThirdwebProvider
        clientId={NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        authConfig={{
          domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
          authUrl: '/api/thirdweb-auth',
        }}
      >
        {children}
      </ThirdwebProvider>
    </SessionProvider>
  )
}
