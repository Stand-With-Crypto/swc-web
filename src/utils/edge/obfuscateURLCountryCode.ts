import { NextRequest, NextResponse } from 'next/server'

import { extractCountryCodeFromPathname } from '@/utils/server/extractCountryCodeFromPathname'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

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
export function obfuscateURLCountryCode(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const searchParams = request.nextUrl.search

  const maybeCountryCode = extractCountryCodeFromPathname(pathname)

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
