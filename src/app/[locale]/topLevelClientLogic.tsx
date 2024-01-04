'use client'
import * as Sentry from '@sentry/nextjs'
import { Base } from '@thirdweb-dev/chains'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import {
  ThirdwebProvider,
  coinbaseWallet,
  embeddedWallet,
  en,
  metamaskWallet,
  rainbowWallet,
  useAddress,
  walletConnect,
} from '@thirdweb-dev/react'

import {
  ClientAnalyticActionType,
  ClientAnalyticComponentType,
  initAnalytics,
  trackClientAnalytic,
} from '@/utils/web/clientAnalytics'
import { maybeSetUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const NEXT_PUBLIC_THIRDWEB_CLIENT_ID = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  'process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
)

const InitialOrchestration = () => {
  const pathname = usePathname()
  const address = useAddress()
  // Not, in local dev this component will double render. It doesn't do this after it is built (verify in testing)
  useEffect(() => {
    const sessionId = maybeSetUserSessionIdOnClient()
    initAnalytics(sessionId)
    Sentry.setUser({ id: sessionId, idType: 'session' })
  }, [])
  useEffect(() => {
    if (address) {
      Sentry.setUser({ id: address, idType: 'cryptoAddress' })
    }
  }, [address])
  useEffect(() => {
    if (!pathname) {
      return
    }
    trackClientAnalytic('Page Visited', {
      pathname,
      component: ClientAnalyticComponentType.page,
      action: ClientAnalyticActionType.view,
    })
  }, [pathname])
  return null
}

// This component includes all top level client-side logic
export function TopLevelClientLogic({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider
      locale={en()}
      activeChain={Base}
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet({ recommended: true }),
        walletConnect(),
        embeddedWallet({
          auth: {
            options: ['google', 'email'],
          },
        }),
      ]}
      clientId={NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      authConfig={{
        domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
        authUrl: '/api/auth',
      }}
    >
      <InitialOrchestration />
      {children}
    </ThirdwebProvider>
  )
}
