import cookie from 'js-cookie'

import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

export function getUserSessionIdOnClient() {
  const value = cookie.get(USER_SESSION_ID_COOKIE_NAME)
  return value
}
