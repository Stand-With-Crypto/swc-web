'use server'

import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'
import { after } from 'next/server'

import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'

export async function onLogout() {
  const currentCookies = await cookies()
  const localUser = await parseLocalUserFromCookies()

  const token = currentCookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
  const decodedToken = token?.value ? jwtDecode<{ ctx?: { userId?: string } }>(token.value) : null
  const { userId } = decodedToken?.ctx ?? {}

  after(getServerAnalytics({ userId: userId ?? '', localUser }).track('User Logged Out').flush)

  currentCookies.delete(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
}
