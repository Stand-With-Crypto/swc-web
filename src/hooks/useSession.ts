import React from 'react'
import * as Sentry from '@sentry/nextjs'
import Cookies from 'js-cookie'
import { usePathname } from 'next/navigation'
import { useActiveWallet, useDisconnect } from 'thirdweb/react'

import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { onLogout } from '@/utils/server/thirdweb/onLogout'
import { LOGOUT_ACTION_EVENT } from '@/utils/shared/eventListeners'
import { generateUserSessionId, USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

export function useSession() {
  const fullProfileRequest = useApiResponseForUserFullProfileInfo()
  const { session: thirdwebSession } = useThirdwebSession()

  const isLoading = fullProfileRequest.isLoading

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

  const pathname = usePathname()
  const internalUrls = useIntlUrls()

  const handleLogoutSuccess = React.useCallback(() => {
    Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId())

    if (pathname === internalUrls.profile()) {
      window.location.replace(internalUrls.home())
    } else {
      window.location.reload()
    }
  }, [internalUrls, pathname])

  const logout = React.useCallback(async () => {
    // This is used to trigger the login button to update the isLoggingOut state to true
    document.dispatchEvent(new CustomEvent(LOGOUT_ACTION_EVENT))

    await logoutAndDisconnect()

    handleLogoutSuccess()
  }, [handleLogoutSuccess, logoutAndDisconnect])

  return {
    logout,
  }
}

function useThirdwebSession() {
  const session = useThirdwebAuthUser()
  const { disconnect } = useDisconnect()
  const wallet = useActiveWallet()

  return {
    session,
    logoutAndDisconnect: React.useCallback(async () => {
      try {
        if (wallet) {
          disconnect(wallet)
        }

        await onLogout()
      } catch (err) {
        Sentry.captureException(err, { tags: { domain: 'logoutAndDisconnect' } })
      }
    }, [disconnect, wallet]),
  }
}
