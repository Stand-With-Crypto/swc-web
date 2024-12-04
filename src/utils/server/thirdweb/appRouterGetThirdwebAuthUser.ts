import 'server-only'

import { cookies } from 'next/headers'

import { parseThirdwebAddress } from '@/hooks/useThirdwebAddress/parseThirdwebAddress'
import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export async function appRouterGetThirdwebAuthUser(): Promise<{
  userId: string
  address: string
} | null> {
  const currentCookies = await cookies()
  const token = currentCookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)

  if (!token?.value) {
    return null
  }

  const jwtToken = await thirdwebAuth.verifyJWT({ jwt: token.value })

  if (!jwtToken.valid) {
    return null
  }

  const { userId, address } =
    (jwtToken.parsedJWT?.ctx as { userId?: string; address?: string }) ?? {}

  return {
    userId: userId ?? '',
    address: parseThirdwebAddress(address ?? ''),
  }
}
