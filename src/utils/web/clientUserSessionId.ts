import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'
import * as Sentry from '@sentry/nextjs'
import cookie from 'js-cookie'

export function getUserSessionIdOnClient() {
  const value = cookie.get(USER_SESSION_ID_COOKIE_NAME)
  if (!value) {
    // this should be getting set in middleware so we want to trigger some analytics errors if its not set
    Sentry.captureMessage(`getSessionIdOnClient: cookie not set`, { extra: { value } })
  }
  return value!
}
