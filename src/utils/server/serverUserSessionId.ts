import * as Sentry from '@sentry/nextjs'
import { cookies, headers } from 'next/headers'

import {
  USER_SESSION_ID_COOKIE_NAME,
  USER_SESSION_ID_HEADER_NAME,
} from '@/utils/shared/userSessionId'

export function getUserSessionIdThatMightNotExist() {
  const userCookies = cookies()
  const requestHeaders = headers()
  return (
    requestHeaders.get(USER_SESSION_ID_HEADER_NAME) ||
    userCookies.get(USER_SESSION_ID_COOKIE_NAME)?.value
  )
}

export function getUserSessionId() {
  const userCookies = cookies()
  const sessionId = getUserSessionIdThatMightNotExist()
  if (!sessionId) {
    Sentry.captureMessage(`getUserSessionIdOnAppRouter: cookie/header not set`, {
      extra: { headers: headers(), cookies: userCookies.getAll() },
    })
    throw new Error('user session cookie/header not set')
  }
  return sessionId
}
