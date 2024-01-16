import { useDisconnect, useUser, useLogout } from '@thirdweb-dev/react'
import { usePathname, useRouter } from 'next/navigation'

import { useIntlUrls } from '@/hooks/useIntlUrls'

export function useThirdWeb() {
  const session = useUser()
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
    },
  }
}
