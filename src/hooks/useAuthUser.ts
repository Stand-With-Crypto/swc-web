import { useMemo } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useActiveWalletConnectionStatus } from 'thirdweb/react'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export function useThirdwebAuthUser() {
  useActiveWalletConnectionStatus()

  const token = Cookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)

  const { userId, address } = useMemo(() => {
    const decodedToken = token
      ? jwtDecode<{ ctx?: { userId?: string; address?: string } }>(token)
      : null
    const { userId, address } = decodedToken?.ctx ?? {}

    return { userId, address }
  }, [token])

  return {
    isLoggedIn: !!userId,
    user: {
      userId,
      address: parseThirdwebAddress(address ?? ''),
    },
  }
}
