import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

// Two lowercase letters (e.g., "us", "uk")
const COUNTRY_CODE_PATTERN = /^[a-z]{2}$/

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

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase() ?? null
  const defaultCountryCode = DEFAULT_SUPPORTED_COUNTRY_CODE.toLowerCase()

  const createUrl = (path: string): URL => new URL(`${path}${searchParams}`, request.url)

  // If path starts with default country code, redirect to path without it
  if (firstSegment === defaultCountryCode) {
    const newPath = pathname.replace(`/${defaultCountryCode}`, '') || '/'
    return NextResponse.redirect(createUrl(newPath))
  }

  // If path doesn't start with any country code, rewrite to include default country code
  if (!firstSegment || !COUNTRY_CODE_PATTERN.test(firstSegment)) {
    const newPath = `/${defaultCountryCode}${pathname}`
    return NextResponse.rewrite(createUrl(newPath))
  }

  // For all other country codes, keep them visible in the URL
  return NextResponse.next()
}
