import { v4 as uuidv4 } from 'uuid'
import cookie from 'js-cookie'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { logger } from '@/utils/shared/logger'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'

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
    REPLACE_ME__captureException(new Error(`getSessionIdOnClient: cookie not set`))
  }
  return value!
}
