import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/intl/locales'
import { i18nRouter } from 'next-i18n-router'
import { NextRequest } from 'next/server'

// taken from https://i18nexus.com/tutorials/nextjs/react-intl

export function middleware(request: NextRequest) {
  return i18nRouter(request, {
    locales: SUPPORTED_LOCALES as string[],
    defaultLocale: DEFAULT_LOCALE,
  })
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
