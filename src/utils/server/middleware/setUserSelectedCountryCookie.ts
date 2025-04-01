import { NextRequest, NextResponse } from 'next/server'

import { extractCountryCodeFromPathname } from '@/utils/server/middleware/extractCountryCodeFromPathname'
import { setResponseCookie } from '@/utils/server/middleware/setResponseCookie'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'

export function setUserSelectedCountryCookie(request: NextRequest, response: NextResponse) {
  const userSelectedCountryCookie = request.cookies.get(USER_SELECTED_COUNTRY_COOKIE_NAME)?.value
  const maybeCountryCodeFromPathname = extractCountryCodeFromPathname(request.nextUrl.pathname)

  if (!maybeCountryCodeFromPathname || userSelectedCountryCookie === maybeCountryCodeFromPathname) {
    return
  }

  const isUserSelectedCountryCookieSupported = COUNTRY_CODE_REGEX_PATTERN.test(
    maybeCountryCodeFromPathname,
  )

  if (!isUserSelectedCountryCookieSupported) {
    return
  }

  setResponseCookie({
    response,
    cookieName: USER_SELECTED_COUNTRY_COOKIE_NAME,
    cookieValue: maybeCountryCodeFromPathname,
  })
}
