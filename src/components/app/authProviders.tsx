'use client'
import { requiredEnv } from '@/utils/shared/requiredEnv'
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
