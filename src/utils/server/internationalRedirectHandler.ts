import { NextRequest, NextResponse } from 'next/server'

import {
  getCountryCode,
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export function internationalRedirectHandler(request: NextRequest) {
  const existingCountryCode = request.cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value
  const parsedExistingCountryCode = parseUserCountryCodeCookie(existingCountryCode)

  const userCountryCode = getCountryCode(request)

  // Redirect to a different country homepage if:
  // - If the requested page is the homepage
  const requestedPathname = request.nextUrl.pathname
  const homepagePathnameRegex = new RegExp(
    `^/(|(${Object.values(SupportedCountryCodes).join('|')}))$`,
  )
  const isHomepageRequested = homepagePathnameRegex.test(requestedPathname)

  // - If the country cookie is not set
  const isCountryCookieNotSet = !existingCountryCode

  // - If the IP country code is supported by SWC
  const isIPCountryCodeSupported = COUNTRY_CODE_REGEX_PATTERN.test(userCountryCode?.toLowerCase())

  // - If the IP country code is different from the requested page country code
  const isIPCountryCodeDifferentFromTheCountryCodeCookie =
    parsedExistingCountryCode?.countryCode !== userCountryCode

  const shouldRedirect =
    isHomepageRequested &&
    isCountryCookieNotSet &&
    isIPCountryCodeSupported &&
    isIPCountryCodeDifferentFromTheCountryCodeCookie

  // TODO(@twistershark): Remove the isProd comparison after the internationalization feature is fully implemented
  const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
  if (shouldRedirect && !isProd) {
    return NextResponse.redirect(new URL(`/${userCountryCode?.toLowerCase()}`, request.url))
  }
}
