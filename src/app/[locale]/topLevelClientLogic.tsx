'use client'
import { Suspense, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Base } from '@thirdweb-dev/chains'
import {
  coinbaseWallet,
  embeddedWallet,
  en,
  metamaskWallet,
  ThirdwebProvider,
  walletConnect,
} from '@thirdweb-dev/react'
import { usePathname, useSearchParams } from 'next/navigation'

import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { useDetectWipedDatabaseAndLogOutUser } from '@/hooks/useDetectWipedDatabaseAndLogOutUser'
import { LocaleContext } from '@/hooks/useLocale'
import { SupportedLocale } from '@/intl/locales'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN } from '@/utils/shared/sharedEnv'
import { maybeInitClientAnalytics, trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { bootstrapLocalUser } from '@/utils/web/clientLocalUser'
import { getUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'
import { identifyUserOnClient } from '@/utils/web/identifyUser'

const NEXT_PUBLIC_THIRDWEB_CLIENT_ID = requiredEnv(
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  'NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
)

const InitialOrchestration = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const authUser = useThirdwebAuthUser()
  useDetectWipedDatabaseAndLogOutUser()
  // Note, in local dev this component will double render. It doesn't do this after it is built (verify in testing)
  useEffect(() => {
    bootstrapLocalUser()
    maybeInitClientAnalytics()
    const sessionId = getUserSessionIdOnClient()
    if (sessionId) {
      Sentry.setUser({ id: sessionId, idType: 'session' })
    }
  }, [])
  const searchParamsUserId = searchParams?.get('userId')
  useEffect(() => {
    if (authUser.user || searchParamsUserId) {
      identifyUserOnClient(authUser.user || { userId: searchParamsUserId! })
    }
    if (authUser.user && searchParamsUserId && authUser.user.userId !== searchParamsUserId) {
      Sentry.captureMessage('mismatch between authenticated user and userId in search param', {
        extra: {
          authUser: authUser.user,
          searchParamsUserId,
        },
      })
    }
  }, [authUser.user, searchParamsUserId])
  useEffect(() => {
    if (!pathname) {
      return
    }
    trackClientAnalytic('Page Visited', {
      pathname,
      component: AnalyticComponentType.page,
      action: AnalyticActionType.view,
    })
  }, [pathname])
  return null
}

// This component includes all top level client-side logic
export function TopLevelClientLogic({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: SupportedLocale
}) {
  console.log('TopLevelClientLogic')

  try {
    const clear = localStorage.clear
    const getItem = localStorage.getItem
    const key = localStorage.key
    const removeItem = localStorage.removeItem
    const setItem = localStorage.setItem

    localStorage.clear = function () {
      try {
        clear.call(this)
      } catch (e) {
        console.error('Failed to clear localStorage:', e)
      }
    }

    localStorage.getItem = function (keyString) {
      try {
        console.log('Getting item from localStorage:', keyString)
        return getItem.call(this, keyString)
      } catch (e) {
        console.error('Failed to retrieve item from localStorage:', e)
        return null
      }
    }

    localStorage.key = function (index) {
      try {
        console.log('Getting key from localStorage:', index)
        return key.call(this, index)
      } catch (e) {
        console.error('Failed to retrieve key from localStorage:', e)
        return null
      }
    }

    localStorage.removeItem = function (keyString) {
      try {
        console.log('Removing item from localStorage:', keyString)
        removeItem.call(this, keyString)
      } catch (e) {
        console.error('Failed to remove item from localStorage:', e)
      }
    }

    localStorage.setItem = function (keyString, value) {
      try {
        console.log('Storing item in localStorage:', keyString, value)
        setItem.call(this, keyString, value)
      } catch (e) {
        console.error('Failed to store item in localStorage:', e)
      }
    }
  } catch (e) {
    console.error('Failed to override localStorage methods:', e)
  }

  return (
    <LocaleContext.Provider value={locale}>
      <ThirdwebProvider
        activeChain={Base}
        authConfig={{
          domain: NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
          authUrl: '/api/auth',
        }}
        clientId={NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
        locale={en()}
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
      >
        {/* https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
        <Suspense>
          <InitialOrchestration />
        </Suspense>
        {children}
      </ThirdwebProvider>
    </LocaleContext.Provider>
  )
}
