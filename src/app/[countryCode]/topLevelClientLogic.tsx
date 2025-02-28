'use client'

import { Suspense, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ThirdwebProvider, useAutoConnect } from 'thirdweb/react'

import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { CountryCodeContext } from '@/hooks/useCountryCode'
import { useDetectWipedDatabaseAndLogOutUser } from '@/hooks/useDetectWipedDatabaseAndLogOutUser'
import { usePromoteDevParticipation } from '@/hooks/usePromoteDevParticipation'
import { useReloadDueToInactivity } from '@/hooks/useReloadDueToInactivity'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { thirdwebClient } from '@/utils/shared/thirdwebClient'
import { getUserIdOnClient } from '@/utils/shared/userId'
import { maybeInitClientAnalytics, trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { bootstrapLocalUser } from '@/utils/web/clientLocalUser'
import { getUserSessionIdOnClient } from '@/utils/web/clientUserSessionId'
import { identifyUserOnClient } from '@/utils/web/identifyUser'

interface InitialOrchestrationProps {
  countryCode: SupportedCountryCodes
}

const InitialOrchestration = ({ countryCode }: InitialOrchestrationProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const authUser = useThirdwebAuthUser()

  useReloadDueToInactivity({ timeInMinutes: 25 })

  useAutoConnect({
    client: thirdwebClient,
  })
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
  useEffect(() => {
    Sentry.setTag('countryCode', countryCode)
  }, [countryCode])
  useEffect(() => {
    const clientUserId = getUserIdOnClient()
    if (authUser.user?.userId || clientUserId) {
      identifyUserOnClient({ userId: authUser.user?.userId ?? clientUserId! })
    }
    if (authUser.user && clientUserId && authUser.user.userId !== clientUserId) {
      Sentry.captureMessage('mismatch between authenticated user and userId in cookie value', {
        extra: {
          authUserId: authUser.user.userId,
          clientUserId,
        },
      })
    }
  }, [authUser.user])
  const unexpectedUrl = searchParams?.get('unexpectedUrl')
  useEffect(() => {
    if (unexpectedUrl) {
      Sentry.captureMessage('unexpectedUrl')
    }
  }, [unexpectedUrl])
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

  useEffect(() => {
    const searchParamsSessionId = searchParams?.get('sessionId')
    if (searchParamsSessionId) {
      const params = new URLSearchParams(searchParams?.toString())
      params.delete('sessionId')
      params.delete('userId')
      router.replace(`${pathname || '/'}?${params.toString()}`)
    }
  }, [router, searchParams, pathname])

  return null
}

// This component includes all top level client-side logic
export function TopLevelClientLogic({
  children,
  countryCode,
}: {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
}) {
  usePromoteDevParticipation()

  return (
    <CountryCodeContext.Provider value={countryCode}>
      <ThirdwebProvider>
        {/* https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
        <Suspense>
          <InitialOrchestration countryCode={countryCode} />
        </Suspense>
        {children}
      </ThirdwebProvider>
    </CountryCodeContext.Provider>
  )
}
