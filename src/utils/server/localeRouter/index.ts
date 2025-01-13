import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_LOCALE = 'en-US' as const

/**
 * Custom router that hides the default locale (en-US) from URLs
 * while keeping other locales visible.
 */
export function localeRouter(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // If path starts with default locale, redirect to path without it
  if (firstSegment === DEFAULT_LOCALE) {
    const newPath = pathname.replace(`/${DEFAULT_LOCALE}`, '') || '/'
    const searchParams = request.nextUrl.search

    return NextResponse.redirect(new URL(`${newPath}${searchParams}`, request.url))
  }

  // If path doesn't start with any locale, rewrite to include default locale
  if (!firstSegment || firstSegment.indexOf('-') === -1) {
    const newPath = `/${DEFAULT_LOCALE}${pathname}`
    const searchParams = request.nextUrl.search

    return NextResponse.rewrite(new URL(`${newPath}${searchParams}`, request.url))
  }

  // For all other locales, keep them visible in the URL
  return NextResponse.next()
}
