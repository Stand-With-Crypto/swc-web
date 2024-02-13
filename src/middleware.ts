import { NextRequest } from 'next/server'
import { i18nRouter } from 'next-i18n-router'

import { DEFAULT_LOCALE, ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { getLogger } from '@/utils/shared/logger'
import { generateUserSessionId, USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

const logger = getLogger('middleware')
// taken from https://i18nexus.com/tutorials/nextjs/react-intl

// The conditionals for cypress silence some of the annoying logs that show up when spinning up the e2e server environment

export function middleware(request: NextRequest) {
  if (isCypress) {
    request.headers.set('accept-language', 'en-US,en;q=0.9')
  }
  const i18nParsedResponse = i18nRouter(request, {
    locales: ORDERED_SUPPORTED_LOCALES as string[],
    defaultLocale: DEFAULT_LOCALE,
  })
  const urlSessionId = request.nextUrl.searchParams.get('sessionId')
  const existingSessionId = request.cookies.get(USER_SESSION_ID_COOKIE_NAME)?.value
  if (urlSessionId && urlSessionId !== existingSessionId) {
    logger.info(`session id being set via url: ${urlSessionId}`)
    i18nParsedResponse.cookies.set({
      name: USER_SESSION_ID_COOKIE_NAME,
      value: urlSessionId,
      httpOnly: false,
    })
  } else if (!existingSessionId) {
    const sessionId = generateUserSessionId()
    if (!isCypress) {
      logger.info(`setting initial session id: ${sessionId}`)
    }
    i18nParsedResponse.cookies.set({
      name: USER_SESSION_ID_COOKIE_NAME,
      value: sessionId,
      httpOnly: false,
    })
  }
  return i18nParsedResponse
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next|favicon.ico).*)',
}
