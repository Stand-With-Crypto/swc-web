import { useDisconnect, useUser, useLogout, useWallet, useAddress } from '@thirdweb-dev/react'
import { usePathname, useRouter } from 'next/navigation'

import { useIntlUrls } from '@/hooks/useIntlUrls'
import useSWR from 'swr'

export function useThirdwebData() {
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
