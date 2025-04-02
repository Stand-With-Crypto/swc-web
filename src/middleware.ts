import { NextRequest } from 'next/server'

import { internationalRedirectHandler } from '@/utils/edge/internationalRedirectHandler'
import { obfuscateURLCountryCode } from '@/utils/edge/obfuscateURLCountryCode'
import { setResponseCookie } from '@/utils/edge/setResponseCookie'
import { setSessionCookiesFromRequest } from '@/utils/edge/setSessionCookies'
import { isCypress } from '@/utils/shared/executionEnvironment'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

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
      maxAge: 24 * 60 * 60 * 1000, // 24 hours,
    })
  }

  return response
}

export const config = {
  matcher: '/((?!api|static|embedded|.*\\..*|_next|favicon.ico).*)',
}
