import { useMemo } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useActiveWalletConnectionStatus } from 'thirdweb/react'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export function useThirdwebAuthUser() {
  // We are not using the return value here because what we want is to trigger
  // a rerender when the wallet connection status changes.
  // This way, we can update the user data when the user connects or disconnects
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
    user: userId
      ? {
          userId,
          address: parseThirdwebAddress(address ?? ''),
        }
      : undefined,
  }
}
