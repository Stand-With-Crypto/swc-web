'use server'

import { cookies } from 'next/headers'

import { thirdwebAuth } from '@/utils/server/thirdweb/thirdwebAuthClient'

export async function isLoggedIn() {
  const currentCookies = await cookies()
  const jwt = currentCookies.get('jwt')
  if (!jwt?.value) {
    return false
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value })
  if (!authResult.valid) {
    return false
  }
  return true
}
