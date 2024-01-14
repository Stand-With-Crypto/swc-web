import * as Sentry from '@sentry/nextjs'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'
import { NextApiRequest } from 'next'
import { cookies, headers } from 'next/headers'

export function getUserSessionIdOnPageRouter(req: NextApiRequest) {
  const value = req.cookies[USER_SESSION_ID_COOKIE_NAME]
  if (!value) {
    // this should be getting set in middleware so we want to trigger some analytics errors if its not set
    Sentry.captureMessage(`getUserSessionIdOnPageRouter: cookie not set`)
  }
  return value!
}

export function getUserSessionIdThatMightNotExist() {
  const userCookies = cookies()
  const sessionId = userCookies.get(USER_SESSION_ID_COOKIE_NAME)
  return sessionId?.value
}

export function getUserSessionId() {
  const userCookies = cookies()
  const sessionId = userCookies.get(USER_SESSION_ID_COOKIE_NAME)
  if (!sessionId) {
    Sentry.captureMessage(`getUserSessionIdOnAppRouter: cookie not set`, {
      extra: { headers: headers(), cookies: userCookies.getAll() },
    })
    throw new Error('user session cookie not set')
  }
  return sessionId.value
}
