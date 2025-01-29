import { NextRequest, NextResponse } from 'next/server'

import { LOCALE_COOKIE } from '@/utils/shared/supportedLocales'

const DEFAULT_LOCALE = 'en-US' as const
const LOCALE_MATCHER = /^[a-z]{2}-[A-Z]{2}$/

/**
 * Custom router that hides the default locale (en-US) from URLs
 * while keeping other locales visible.
 */
export function localeRouter(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  const requestLocale =
    !!firstSegment && firstSegment.match(LOCALE_MATCHER) ? firstSegment : DEFAULT_LOCALE

  // If path starts with default locale, redirect to path without it
  if (firstSegment === DEFAULT_LOCALE) {
    const newPath = pathname.replace(`/${DEFAULT_LOCALE}`, '') || '/'
    const searchParams = request.nextUrl.search

    return setLocaleCookie(
      NextResponse.redirect(new URL(`${newPath}${searchParams}`, request.url)),
      requestLocale,
    )
  }

  // If path doesn't start with any locale, rewrite to include default locale
  if (!firstSegment || !firstSegment.match(LOCALE_MATCHER)) {
    const newPath = `/${DEFAULT_LOCALE}${pathname}`
    const searchParams = request.nextUrl.search

    return setLocaleCookie(
      NextResponse.rewrite(new URL(`${newPath}${searchParams}`, request.url)),
      requestLocale,
    )
  }

  // For all other locales, keep them visible in the URL
  return setLocaleCookie(NextResponse.next(), requestLocale)
}

function setLocaleCookie(response: NextResponse, locale: string) {
  const localeCookie = response.cookies.get(LOCALE_COOKIE)

  if (localeCookie?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale)
  }

  return response
}
