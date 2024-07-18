import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useActiveAccount } from 'thirdweb/react'

import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/actions/actionAuthenticateUsingThirdweb'
import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'

export function useThirdwebAuthUser() {
  const account = useActiveAccount()
  const address = account?.address ?? ''

  const token = Cookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  const decodedToken = token ? jwtDecode<{ userId?: string }>(token) : null
  const { userId } = decodedToken ?? {}

  return {
    isLoggedIn: !!token,
    user: {
      userId,
      address: parseThirdwebAddress(address),
    },
  }
}
