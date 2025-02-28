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

const HAS_REDIRECTED_HEADER = 'x-swc-international-redirected'

type CountryCookieData = {
  countryCode: string
  bypassed: boolean
}

export function internationalRedirectHandler(request: NextRequest): {
  response?: NextResponse
  countryCookie?: CountryCookieData | null
} {
  if (request.headers.get(HAS_REDIRECTED_HEADER)) {
    return { response: NextResponse.next() }
  }

  const geoLocationCountryCode = getCountryCode(request)?.toLowerCase()
  const countryCodeCookieData = getCountryCookieData(request)

  const responseCountryCodeCookie = shouldUpdateCountryCookie(
    countryCodeCookieData,
    geoLocationCountryCode,
  )
    ? { countryCode: geoLocationCountryCode, bypassed: false }
    : null

  if (
    shouldRedirectToCountrySpecificHomepage(request, geoLocationCountryCode, countryCodeCookieData)
  ) {
    const response = createRedirectResponse(request, geoLocationCountryCode)
    return {
      response,
      countryCookie: responseCountryCodeCookie,
    }
  }

  return {
    countryCookie: responseCountryCodeCookie,
  }
}

function getCountryCookieData(request: NextRequest): CountryCookieData | null {
  const existingCountryCode = request.cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value
  return parseUserCountryCodeCookie(existingCountryCode)
}

function shouldRedirectToCountrySpecificHomepage(
  request: NextRequest,
  geoLocationCountryCode: string,
  countryCodeCookieData: CountryCookieData | null,
): boolean {
  // TODO(@twistershark): Remove the isProd comparison after the internationalization feature is fully implemented
  const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
  if (isProd) return false

  const isHomepageRequested = new RegExp(
    `^/(|(${Object.values(SupportedCountryCodes).join('|')}))$`,
  ).test(request.nextUrl.pathname)
  console.log('isHomepageRequested', isHomepageRequested)
  if (!isHomepageRequested) return false

  const isCountryCodeCookieDefined = request.cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value
  console.log('isCountryCodeCookieDefined', isCountryCodeCookieDefined)
  if (isCountryCodeCookieDefined) return false

  const isCountryCodeSupported = COUNTRY_CODE_REGEX_PATTERN.test(
    geoLocationCountryCode?.toLowerCase(),
  )
  console.log('isCountryCodeSupported', isCountryCodeSupported)
  if (!isCountryCodeSupported) return false

  const geoLocationCountryCodeMatchesTheCountryCodeCookie =
    geoLocationCountryCode === countryCodeCookieData?.countryCode
  console.log(
    'geoLocationCountryCodeMatchesTheCountryCodeCookie',
    geoLocationCountryCodeMatchesTheCountryCodeCookie,
  )
  if (geoLocationCountryCodeMatchesTheCountryCodeCookie) return false

  console.log('deve redirecionar')

  return true
}

function shouldUpdateCountryCookie(
  countryCodeCookieData: CountryCookieData | null,
  geoLocationCountryCode: string,
): boolean {
  return (
    countryCodeCookieData?.countryCode !== geoLocationCountryCode &&
    !countryCodeCookieData?.bypassed
  )
}

function createRedirectResponse(
  request: NextRequest,
  geoLocationCountryCode: string,
): NextResponse {
  const response = NextResponse.redirect(new URL(`/${geoLocationCountryCode}`, request.url))
  response.headers.set(HAS_REDIRECTED_HEADER, 'true')
  return response
}
