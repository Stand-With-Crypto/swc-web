import { NextRequest, NextResponse } from 'next/server'

import { setResponseCookie } from '@/utils/server/middleware/setResponseCookie'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { getLogger } from '@/utils/shared/logger'
import { USER_ID_COOKIE_NAME } from '@/utils/shared/userId'
import { generateUserSessionId, USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

const logger = getLogger('setSessionCookiesFromRequest')

export function setSessionCookiesFromRequest(request: NextRequest, response: NextResponse) {
  // Session ID from URL or generate new one
  const urlSessionId = request.nextUrl.searchParams.get('sessionId')
  const existingSessionId = request.cookies.get(USER_SESSION_ID_COOKIE_NAME)?.value

  if (urlSessionId && urlSessionId !== existingSessionId) {
    logger.info(`session id being set via url: ${urlSessionId}`)
    setResponseCookie({
      response,
      cookieName: USER_SESSION_ID_COOKIE_NAME,
      cookieValue: urlSessionId,
    })
  } else if (!existingSessionId) {
    const sessionId = generateUserSessionId()
    if (!isCypress) {
      logger.info(`setting initial session id: ${sessionId}`)
    }
    setResponseCookie({
      response,
      cookieName: USER_SESSION_ID_COOKIE_NAME,
      cookieValue: sessionId,
    })
  }

  // User ID from URL
  const urlUserId = request.nextUrl.searchParams.get('userId')
  if (urlUserId) {
    setResponseCookie({
      response,
      cookieName: USER_ID_COOKIE_NAME,
      cookieValue: urlUserId,
    })
  }
}
