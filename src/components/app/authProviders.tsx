'use client'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import { ThirdwebProvider } from '@thirdweb-dev/react'

const NEXT_PUBLIC_THIRDWEB_CLIENT_ID = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  'process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
)

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider
      clientId={NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      authConfig={{
        domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
        authUrl: '/api/auth',
      }}
    >
      {children}
    </ThirdwebProvider>
  )
}
