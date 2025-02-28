import { NextRequest, NextResponse } from 'next/server'

import { countryCodeObfuscator } from '@/utils/server/countryCodeObfuscator'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { internationalRedirectHandler } from '@/utils/server/internationalRedirectHandler'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { getLogger } from '@/utils/shared/logger'
import { USER_ID_COOKIE_NAME } from '@/utils/shared/userId'
import { generateUserSessionId, USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

const logger = getLogger('middleware')

// The conditionals for cypress silence some of the annoying logs that show up when spinning up the e2e server environment
export function middleware(request: NextRequest) {
  if (isCypress) {
    request.headers.set('accept-language', 'en-US,en;q=0.9')
  }

  const { response = countryCodeObfuscator(request), countryCookie } =
    internationalRedirectHandler(request)

  setSessionCookiesFromRequest(request, response)

  if (countryCookie) {
    setResponseCookie({
      response,
      cookieName: USER_COUNTRY_CODE_COOKIE_NAME,
      cookieValue: JSON.stringify(countryCookie),
      maxAge: 24 * 60 * 60 * 1000, // 24 hours,
    })
  }

  return response
}

export const config = {
  matcher: '/((?!api|static|embedded|.*\\..*|_next|favicon.ico).*)',
}

function setSessionCookiesFromRequest(request: NextRequest, response: NextResponse) {
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

function setResponseCookie({
  cookieName,
  cookieValue,
  response,
  maxAge,
}: {
  response: NextResponse
  cookieName: string
  cookieValue: string
  maxAge?: number
}) {
  response.cookies.set({
    name: cookieName,
    value: cookieValue,
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    ...(maxAge && { maxAge }),
  })
}
