import * as Sentry from '@sentry/nextjs'
import { cookies, headers } from 'next/headers'

import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

export async function getUserSessionIdThatMightNotExist() {
  const currentCookies = await cookies()
  const sessionId = currentCookies.get(USER_SESSION_ID_COOKIE_NAME)
  return sessionId?.value
}

export async function getUserSessionId() {
  const currentCookies = await cookies()
  const currentHeaders = await headers()
  const sessionId = await getUserSessionIdThatMightNotExist()
  if (!sessionId) {
    Sentry.captureMessage(`getUserSessionIdOnAppRouter: cookie not set`, {
      extra: {
        headers: currentHeaders,
        cookies: currentCookies.getAll(),
      },
    })
    throw new Error('user session cookie not set')
  }
  return sessionId
}
