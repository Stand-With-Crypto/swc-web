import { NextRequest } from 'next/server'

import { internationalRedirectHandler } from '@/utils/edge/internationalRedirectHandler'
import { obfuscateURLCountryCode } from '@/utils/edge/obfuscateURLCountryCode'
import { setResponseCookie } from '@/utils/edge/setResponseCookie'
import { setSessionCookiesFromRequest } from '@/utils/edge/setSessionCookies'
import { isKnownBotUserAgent } from '@/utils/shared/botUserAgent'
import { isCypress } from '@/utils/shared/executionEnvironment'
import {
  USER_ACCESS_LOCATION_COOKIE_MAX_AGE,
  USER_ACCESS_LOCATION_COOKIE_NAME,
} from '@/utils/shared/userAccessLocation'

// The conditionals for cypress silence some of the annoying logs that show up when spinning up the e2e server environment
export function middleware(request: NextRequest) {
  if (isCypress) {
    request.headers.set('accept-language', 'en-US,en;q=0.9')
  }

  const { response = obfuscateURLCountryCode(request), userAccessLocationCookie } =
    internationalRedirectHandler(request)

  setSessionCookiesFromRequest(request, response)

  if (userAccessLocationCookie) {
    setResponseCookie({
      response,
      cookieName: USER_ACCESS_LOCATION_COOKIE_NAME,
      cookieValue: userAccessLocationCookie,
      maxAge: USER_ACCESS_LOCATION_COOKIE_MAX_AGE,
    })
  }

  // Set the custom header on the response for downstream logic
  const userAgent = request.headers.get('user-agent')
  const isBot = isKnownBotUserAgent(userAgent)
  if (isBot) {
    response.headers.set('x-known-bot', 'true')
  }

  return response
}

export const config = {
  matcher: '/((?!api|static|embedded|.*\\..*|_next|favicon.ico).*)',
}
