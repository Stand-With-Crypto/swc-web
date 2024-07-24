import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export function useThirdwebAuthUser() {
  const token = Cookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  const decodedToken = token
    ? jwtDecode<{ ctx?: { userId?: string; address?: string } }>(token)
    : null
  const { userId, address } = decodedToken?.ctx ?? {}

  return {
    isLoggedIn: !!userId,
    user: {
      userId,
      address: parseThirdwebAddress(address ?? ''),
    },
  }
}
