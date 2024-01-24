import { useDisconnect, useLogout } from '@thirdweb-dev/react'
import { usePathname, useRouter } from 'next/navigation'

import { useAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'

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
    },
  }
}
