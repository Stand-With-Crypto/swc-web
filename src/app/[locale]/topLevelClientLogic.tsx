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
  // if (false) {
  // console.log('overriding localStorage methods')

  // const originalClear = Storage.prototype.clear
  // const originalGetItem = Storage.prototype.getItem
  // const originalKey = Storage.prototype.key
  // const originalSetItem = Storage.prototype.setItem
  // const originalRemoveItem = Storage.prototype.removeItem

  // Storage.prototype.clear = function () {
  //   try {
  //     console.log('Clearing localStorage')
  //     originalClear.call(localStorage)
  //   } catch (e) {
  //     console.error('Failed to clear localStorage:', e)
  //   }
  // }

  // Storage.prototype.getItem = function (key) {
  //   try {
  //     console.log('Getting item from localStorage:', key)
  //     return originalGetItem.call(localStorage, key)
  //   } catch (e) {
  //     console.error('Failed to retrieve item from localStorage:', e)
  //     return null
  //   }
  // }

  // Storage.prototype.key = function (index) {
  //   try {
  //     console.log('Getting key from localStorage:', index)
  //     return originalKey.call(localStorage, index)
  //   } catch (e) {
  //     console.error('Failed to retrieve key from localStorage:', e)
  //     return null
  //   }
  // }

  // Storage.prototype.removeItem = function (key) {
  //   try {
  //     console.log('Removing item from localStorage:', key)
  //     originalRemoveItem.call(localStorage, key)
  //   } catch (e) {
  //     console.error('Failed to remove item from localStorage:', e)
  //   }
  // }

  // Storage.prototype.setItem = function (key, value) {
  //   try {
  //     console.log('Storing item in localStorage:', key, value)
  //     originalSetItem.call(localStorage, key, value)
  //   } catch (e) {
  //     console.error('Failed to store item in localStorage:', e)
  //   }
  // }

  // localStorage.clear = Storage.prototype.clear
  // localStorage.getItem = Storage.prototype.getItem
  // localStorage.key = Storage.prototype.key
  // localStorage.removeItem = Storage.prototype.removeItem
  // localStorage.setItem = Storage.prototype.setItem
  // }

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
