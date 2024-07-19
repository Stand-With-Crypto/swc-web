import 'server-only'

import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export async function appRouterGetThirdwebAuthUser(): Promise<{
  userId: string
  address: string
} | null> {
  const token = cookies().get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)

  if (!token?.value) {
    return null
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: token.value })

  if (!authResult.valid) {
    return null
  }

  const decodedToken = token ? jwtDecode<{ userId?: string; address?: string }>(token.value) : null
  const { userId, address } = decodedToken ?? {}

  return {
    userId: userId ?? '',
    address: parseThirdwebAddress(address ?? ''),
  }
}
