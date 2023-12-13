import { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './utils/shared/locales'

// taken from https://nextjs.org/docs/app/building-your-application/routing/internationalization

// const MOCK_LOCALE = 'es'
const MOCK_LOCALE = null

function getLocale(request: NextRequest) {
  const headers = MOCK_LOCALE
    ? { 'accept-language': MOCK_LOCALE }
    : Object.fromEntries(request.headers)
  const languages = new Negotiator({ headers }).languages()

  return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE)
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return

  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return Response.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // // Skip all internal paths (_next)
    // '/((?!_next).*)',
    // // Optional: only run on root (/) URL
    '/',
  ],
}
