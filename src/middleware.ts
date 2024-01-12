import { DEFAULT_LOCALE, ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { getLogger } from '@/utils/shared/logger'
import { USER_SESSION_ID_COOKIE_NAME, generateUserSessionId } from '@/utils/shared/userSessionId'
import { i18nRouter } from 'next-i18n-router'
import { NextRequest } from 'next/server'

const logger = getLogger('middleware')
// taken from https://i18nexus.com/tutorials/nextjs/react-intl

export function middleware(request: NextRequest) {
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
  }
  if (!existingSessionId) {
    const sessionId = generateUserSessionId()
    logger.info(`setting initial session id: ${sessionId}`)
    i18nParsedResponse.cookies.set({
      name: USER_SESSION_ID_COOKIE_NAME,
      value: sessionId,
      httpOnly: false,
    })
  }
  return i18nParsedResponse
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
