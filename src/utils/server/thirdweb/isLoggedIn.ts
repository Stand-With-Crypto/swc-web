'use server'

import { cookies } from 'next/headers'

import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export async function isLoggedIn() {
  const currentCookies = await cookies()
  const jwt = currentCookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  if (!jwt?.value) {
    return false
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value })
  if (!authResult.valid) {
    return false
  }
  return true
}
