import { v4 as uuidv4 } from 'uuid'
import cookie from 'js-cookie'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { logger } from '@/utils/shared/logger'

export const UNAUTHENTICATED_SESSION_ID_NAME = 'SWC_UNAUTHENTICATED_SESSION_ID'

export function generateUnauthenticatedSessionId() {
  return uuidv4()
}

export function maybeSetSessionIdOnClient() {
  const value = cookie.get(UNAUTHENTICATED_SESSION_ID_NAME)
  if (!value) {
    logger.info(`maybeSetSessionIdOnClient: cookie not set, setting it now`)
    const sessionId = generateUnauthenticatedSessionId()
    cookie.set(UNAUTHENTICATED_SESSION_ID_NAME, sessionId)
    return sessionId
  }
  return value
}

export function getSessionIdOnClient() {
  const value = cookie.get(UNAUTHENTICATED_SESSION_ID_NAME)
  if (!value) {
    // this should be getting set in middleware so we want to trigger some analytics errors if its not set
    REPLACE_ME__captureException(new Error(`getSessionIdOnClient: cookie not set`))
  }
  return value!
}
