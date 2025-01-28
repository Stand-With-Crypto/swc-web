import { NextRequest } from 'next/server'

import {
  getCountryCode,
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { localeRouter } from '@/utils/server/localeRouter'
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

  const localeResponse = localeRouter(request)

  const urlSessionId = request.nextUrl.searchParams.get('sessionId')
  const existingSessionId = request.cookies.get(USER_SESSION_ID_COOKIE_NAME)?.value
  if (urlSessionId && urlSessionId !== existingSessionId) {
    logger.info(`session id being set via url: ${urlSessionId}`)
    localeResponse.cookies.set({
      name: USER_SESSION_ID_COOKIE_NAME,
      value: urlSessionId,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })
  } else if (!existingSessionId) {
    const sessionId = generateUserSessionId()
    if (!isCypress) {
      logger.info(`setting initial session id: ${sessionId}`)
    }
    localeResponse.cookies.set({
      name: USER_SESSION_ID_COOKIE_NAME,
      value: sessionId,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })
  }

  const urlUserId = request.nextUrl.searchParams.get('userId')
  if (urlUserId) {
    localeResponse.cookies.set({
      name: USER_ID_COOKIE_NAME,
      value: urlUserId,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })
  }

  const existingCountryCode = request.cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value
  const parsedExistingCountryCode = parseUserCountryCodeCookie(existingCountryCode)

  const userCountryCode = getCountryCode(request)

  if (
    parsedExistingCountryCode?.countryCode !== userCountryCode &&
    !parsedExistingCountryCode?.bypassed
  ) {
    localeResponse.cookies.set({
      name: USER_COUNTRY_CODE_COOKIE_NAME,
      value: JSON.stringify({ countryCode: userCountryCode, bypassed: false }),
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })
  }

  return localeResponse
}

export const config = {
  matcher: '/((?!api|static|embedded|.*\\..*|_next|favicon.ico).*)',
}
