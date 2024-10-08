import React from 'react'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import Cookies from 'js-cookie'
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
  const user = fullProfileRequest.data?.user
  const hasOptInUserAction =
    user?.userActions?.some(userAction => userAction.actionType === UserActionType.OPT_IN) ?? false

  const isLoggedIn = thirdwebSession.isLoggedIn || hasOptInUserAction
  const isLoggedInThirdweb = thirdwebSession.isLoggedIn
  return {
    isLoading: !isLoggedIn && isLoading,
    isLoggedIn,
    isLoggedInThirdweb,
    user,
    hasOptInUserAction,
  }
}

export function useSessionControl() {
  const { logoutAndDisconnect } = useThirdwebSession()

  const internalUrls = useIntlUrls()

  const handleLogoutSuccess = React.useCallback(() => {
    Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId(), {
      sameSite: 'lax',
      secure: true,
    })

    window.location.replace(internalUrls.home())
  }, [internalUrls])

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
