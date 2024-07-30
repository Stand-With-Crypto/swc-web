'use server'

import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export async function onLogout() {
  const localUser = parseLocalUserFromCookies()

  const token = cookies().get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  const decodedToken = token?.value ? jwtDecode<{ ctx?: { userId?: string } }>(token.value) : null
  const { userId } = decodedToken?.ctx ?? {}

  getServerAnalytics({ userId: userId ?? '', localUser }).track('User Logged Out')

  cookies().delete(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
}
