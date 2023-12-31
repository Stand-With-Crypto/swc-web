import * as Sentry from '@sentry/nextjs'
import { logger } from '@/utils/shared/logger'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'
import cookie from 'js-cookie'

export function maybeSetUserSessionIdOnClient() {
  const value = cookie.get(USER_SESSION_ID_COOKIE_NAME)
  if (!value) {
    logger.info(`maybeSetSessionIdOnClient: cookie not set, setting it now`)
    const sessionId = generateUserSessionId()
    cookie.set(USER_SESSION_ID_COOKIE_NAME, sessionId)
    return sessionId
  }
  return value
}

export function forceSetUserSessionIdOnClient() {
  const sessionId = generateUserSessionId()
  cookie.set(USER_SESSION_ID_COOKIE_NAME, sessionId)
  return sessionId
}

export function getUserSessionIdOnClient() {
  const value = cookie.get(USER_SESSION_ID_COOKIE_NAME)
  if (!value) {
    // this should be getting set in middleware so we want to trigger some analytics errors if its not set
    Sentry.captureMessage(`getSessionIdOnClient: cookie not set`, { extra: { value } })
  }
  return value!
}
