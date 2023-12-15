'use client'
import { requiredEnv } from '@/utils/shared/requiredEnv'
// Because most pages that require authentication will mainly be composed of static content, we want to avoid returning session info from the server, and instead fetching/wrapping it on the client
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { SessionProvider } from 'next-auth/react'

const NEXT_PUBLIC_ENVIRONMENT = requiredEnv(
  process.env.NEXT_PUBLIC_ENVIRONMENT,
  'process.env.NEXT_PUBLIC_ENVIRONMENT',
)
const NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
  'process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN',
)

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThirdwebProvider
        clientId={`${NEXT_PUBLIC_ENVIRONMENT}-swc-web`}
        authConfig={{
          domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
          authUrl: '/api/auth',
        }}
      >
        {children}
      </ThirdwebProvider>
    </SessionProvider>
  )
}
