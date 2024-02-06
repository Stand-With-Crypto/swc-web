import { useDisconnect, useLogout, useUser, useWallet } from '@thirdweb-dev/react'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import useSWR from 'swr'

import { useAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'

export function useThirdwebData() {
  const session = useAuthUser()
  const disconnect = useDisconnect()
  const { logout } = useLogout()

  const router = useRouter()
  const pathname = usePathname()
  const internalUrls = useIntlUrls()

  const handleLogoutSuccess = () => {
    if (pathname === internalUrls.profile()) {
      router.push(internalUrls.home())
    } else {
      router.refresh()
    }
  }

  return {
    session,
    logoutAndDisconnect: async () => {
      await Promise.all([logout(), disconnect()])
      handleLogoutSuccess()
      Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId())
    },
  }
}

export function useWalletBalance() {
  const session = useUser()
  const wallet = useWallet()

  const key =
    session.user?.address && wallet?.getBalance
      ? `useWalletBallance-${session.user?.address}`
      : null

  return useSWR(key, async () => {
    return wallet?.getBalance()
  })
}
