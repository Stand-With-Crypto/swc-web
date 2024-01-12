import { useDisconnect, useUser, useLogout } from '@thirdweb-dev/react'
import { usePathname, useRouter } from 'next/navigation'

import { useInternalUrls } from '@/hooks/useInternalUrls'

export function useThirdWeb() {
  const session = useUser()
  const disconnect = useDisconnect()
  const { logout } = useLogout()

  const router = useRouter()
  const pathname = usePathname()
  const internalUrls = useInternalUrls()

  const handleLogoutSuccess = () => {
    // TODO: Change this logic to some that covers all private pages
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
