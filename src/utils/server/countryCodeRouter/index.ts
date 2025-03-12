import { NextRequest, NextResponse } from 'next/server'

import {
  COUNTRY_CODE_REGEX_PATTERN,
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'

function extractCountryCode(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  return COUNTRY_CODE_REGEX_PATTERN.test(firstSegment) ? firstSegment : null
}

/**
 * Routes requests based on country code in the URL path:
 * - Redirects paths starting with default country code to remove it
 * - Rewrites paths without country code to include default code
 * - Passes through paths with other valid country codes
 *
 * @example
 * /us/path → /path (redirect if "us" is default)
 * /path → /us/path (rewrite if "us" is default)
 * /gb/path → /gb/path (pass through)
 */
export function countryCodeRouter(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const searchParams = request.nextUrl.search

  const maybeCountryCode = extractCountryCode(pathname)

  const createUrl = (path: string): URL => new URL(`${path}${searchParams}`, request.url)

  // If path doesn't start with any country code, rewrite to include default country code
  if (!maybeCountryCode) {
    const newPath = `/${DEFAULT_SUPPORTED_COUNTRY_CODE}${pathname}`
    return NextResponse.rewrite(createUrl(newPath))
  }

  // If path starts with default country code, redirect to path without it
  if (maybeCountryCode === DEFAULT_SUPPORTED_COUNTRY_CODE) {
    const newPath = pathname.replace(`/${DEFAULT_SUPPORTED_COUNTRY_CODE}`, '') || '/'
    return NextResponse.redirect(createUrl(newPath))
  }

  // For all other country codes, keep them visible in the URL
  return NextResponse.next()
}

/**
 * Saves the current country code as a cookie
 * @param request - The request object
 * @param response - The response object
 */
export function saveCurrentCountryCodeAsCookie(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl
  const maybeCountryCode = extractCountryCode(pathname)

  const countryCode = maybeCountryCode ?? DEFAULT_SUPPORTED_COUNTRY_CODE

  const maybeCurrentPageCountryCodeCookie = request.cookies.get(
    SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
  )?.value

  if (!maybeCurrentPageCountryCodeCookie || maybeCurrentPageCountryCodeCookie !== countryCode) {
    response.cookies.set({
      name: SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
      value: countryCode,
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
    })
  }
}
