import { v4 as uuidv4 } from 'uuid'

export const USER_SESSION_ID_COOKIE_NAME = 'SWC_UNAUTHENTICATED_SESSION_ID'
export const USER_SESSION_ID_HEADER_NAME = 'Swc-Unauthenticated-Session-Id'

export function generateUserSessionId() {
  return uuidv4()
}
