import { NextRequest, NextResponse } from 'next/server'

import { getCountryCode, USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import {
  COUNTRY_CODE_REGEX_PATTERN,
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
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
  const userSelectedCountryCookie = request.cookies.get(USER_SELECTED_COUNTRY_COOKIE_NAME)?.value

  const maybeResponseCountryCodeCookie = shouldUpdateCountryCookie(
    countryCodeCookieData,
    geoLocationCountryCode,
  )
    ? { countryCode: geoLocationCountryCode, bypassed: false }
    : null

  if (process.env.BYPASS_INTERNATIONAL_REDIRECT === 'true') {
    return {
      countryCookie: maybeResponseCountryCodeCookie,
    }
  }

  if (
    shouldRedirectToCountrySpecificHomepageOnFirstVisit(
      request,
      geoLocationCountryCode,
      countryCodeCookieData,
    )
  ) {
    const response = createRedirectResponse(request, geoLocationCountryCode)
    return {
      response,
      countryCookie: maybeResponseCountryCodeCookie,
    }
  }

  if (shouldRedirectBasedOnUserSelectedCountry(request, userSelectedCountryCookie)) {
    const response = createRedirectResponse(request, userSelectedCountryCookie!)
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

function shouldRedirectToCountrySpecificHomepageOnFirstVisit(
  request: NextRequest,
  geoLocationCountryCode: string,
  countryCodeCookieData: CountryCookieData | null,
): boolean {
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

function shouldRedirectBasedOnUserSelectedCountry(
  request: NextRequest,
  userSelectedCountryCookie?: string,
): boolean {
  if (!userSelectedCountryCookie) return false

  const isUShomepageRequested = new RegExp(`^/$`).test(request.nextUrl.pathname)
  if (!isUShomepageRequested) return false

  if (userSelectedCountryCookie === SupportedCountryCodes.US) return false

  const isCountryCodeSupported = COUNTRY_CODE_REGEX_PATTERN.test(userSelectedCountryCookie)
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
