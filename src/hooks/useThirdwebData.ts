import { useDisconnect, useLogout } from '@thirdweb-dev/react'
import { usePathname, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

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
    logoutAndDisconnect: async () => {
      await Promise.all([logout(), disconnect()])
      Cookies.set(USER_SESSION_ID_COOKIE_NAME, generateUserSessionId())
      handleLogoutSuccess()
    },
    session,
  }
}
