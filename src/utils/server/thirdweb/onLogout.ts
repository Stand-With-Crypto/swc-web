'use server'

import * as Sentry from '@sentry/nextjs'
import { waitUntil } from '@vercel/functions'
import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

import { getServerAnalytics } from '@/utils/server/serverAnalytics'
import { parseLocalUserFromCookies } from '@/utils/server/serverLocalUser'
import { THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX } from '@/utils/shared/thirdwebAuthToken'
import { OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

export async function onLogout() {
  const currentCookies = await cookies()
  const localUser = await parseLocalUserFromCookies()

  try {
    const token = currentCookies.get(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
    const decodedToken = token?.value ? jwtDecode<{ ctx?: { userId?: string } }>(token.value) : null
    const { userId } = decodedToken?.ctx ?? {}

    waitUntil(
      getServerAnalytics({ userId: userId ?? '', localUser })
        .track('User Logged Out')
        .flush(),
    )
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        domain: 'onLogout',
      },
    })
  } finally {
    currentCookies.delete(THIRDWEB_AUTH_TOKEN_COOKIE_PREFIX)
    currentCookies.delete(OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME)
  }
}
