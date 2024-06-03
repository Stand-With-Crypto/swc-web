import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { useDisconnect, useLogout } from '@thirdweb-dev/react'
import Cookies from 'js-cookie'
import { usePathname, useRouter } from 'next/navigation'

import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { generateUserSessionId, USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

export function useSession() {
  const fullProfileRequest = useApiResponseForUserFullProfileInfo()
  const { session: thirdwebSession } = useThirdwebSession()

  const isLoading = thirdwebSession.isLoading || fullProfileRequest.isLoading

  const emailAddress = fullProfileRequest.data?.user?.primaryUserEmailAddress
  const isLoggedIn = thirdwebSession.isLoggedIn || !!emailAddress?.isVerified
  const isLoggedInThirdweb = thirdwebSession.isLoggedIn
  return {
    isLoading: !isLoggedIn && isLoading,
    isLoggedIn,
    isLoggedInThirdweb,
    user: fullProfileRequest.data?.user,
  }
}

export function useSessionControl() {
  const { logoutAndDisconnect } = useThirdwebSession()

  const router = useRouter()
  const pathname = usePathname()
  const internalUrls = useIntlUrls()

  const handleLogoutSuccess = React.useCallback(() => {
    Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId())

    if (pathname === internalUrls.profile()) {
      router.push(internalUrls.home())
    } else {
      window.location.reload()
    }
  }, [internalUrls, pathname, router])

  const logout = React.useCallback(async () => {
    // This is used to trigger the login button to update the isLoggingOut state to true
    document.dispatchEvent(new CustomEvent('logoutAction'))

    await logoutAndDisconnect()

    handleLogoutSuccess()
  }, [handleLogoutSuccess, logoutAndDisconnect])

  return {
    logout,
  }
}

function useThirdwebSession() {
  const session = useThirdwebAuthUser()
  const disconnect = useDisconnect()
  const { logout } = useLogout()

  return {
    session,
    logoutAndDisconnect: React.useCallback(async () => {
      await Promise.all([logout(), disconnect()]).catch(e =>
        Sentry.captureException(e, { tags: { domain: 'logoutAndDisconnect' } }),
      )
    }, [disconnect, logout]),
  }
}
