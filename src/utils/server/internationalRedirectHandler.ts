import { NextRequest, NextResponse } from 'next/server'

import { getCountryCode, USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

type CountryCookieData = {
  countryCode: string
  bypassed: boolean
}

export function internationalRedirectHandler(request: NextRequest): {
  response?: NextResponse
  countryCookie?: CountryCookieData | null
} {
  const geoLocationCountryCode = getCountryCode(request)?.toLowerCase()
  const countryCodeCookieData = getCountryCookieData(request)

  const maybeResponseCountryCodeCookie = shouldUpdateCountryCookie(
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
      countryCookie: maybeResponseCountryCodeCookie,
    }
  }

  return {
    countryCookie: maybeResponseCountryCodeCookie,
  }
}

function getCountryCookieData(request: NextRequest): CountryCookieData | null {
  const existingCountryCode = request.cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

  if (!existingCountryCode) {
    return null
  }

  let parsedCookieValue: CountryCookieData | null = null

  if (existingCountryCode.includes('{')) {
    try {
      parsedCookieValue = JSON.parse(existingCountryCode) as CountryCookieData
    } catch {
      return null
    }
  }

  const countryCode = (parsedCookieValue?.countryCode || existingCountryCode)?.toLowerCase()

  return parsedCookieValue
    ? {
        ...parsedCookieValue,
        countryCode,
      }
    : { countryCode, bypassed: false }
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
  if (!isHomepageRequested) return false

  const isCountryCodeCookieDefined = !!countryCodeCookieData
  if (isCountryCodeCookieDefined) return false

  const isRequestingTheSameCountryCodeAsTheGeoLocationCountryCode =
    request.nextUrl.pathname.startsWith(`/${geoLocationCountryCode}`) ||
    (request.nextUrl.pathname === '/' && geoLocationCountryCode === SupportedCountryCodes.US)
  if (isRequestingTheSameCountryCodeAsTheGeoLocationCountryCode) return false

  const isCountryCodeSupported = COUNTRY_CODE_REGEX_PATTERN.test(
    geoLocationCountryCode?.toLowerCase(),
  )
  if (!isCountryCodeSupported) return false

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
  const currentUrl = new URL(request.url)

  const redirectUrl = new URL(`/${geoLocationCountryCode}`, request.url)

  redirectUrl.search = currentUrl.search

  redirectUrl.hash = currentUrl.hash

  return NextResponse.redirect(redirectUrl)
}
