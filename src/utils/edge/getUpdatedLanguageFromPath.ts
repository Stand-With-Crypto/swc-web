import { NextRequest } from 'next/server'

import { SupportedLanguages, SWC_PAGE_LANGUAGE_COOKIE_NAME } from '@/utils/shared/supportedLocales'

export function getUpdatedLanguageFromPath(request: NextRequest): SupportedLanguages | null {
  const pathname = request.nextUrl.pathname
  const currentLanguageCookie = request.cookies.get(SWC_PAGE_LANGUAGE_COOKIE_NAME)?.value

  // Match EU language paths like /eu/de, /eu/fr, /eu/en
  const euLanguageMatch = pathname.match(/^\/eu\/([a-z]{2})(?:\/|$)/)

  if (!euLanguageMatch) {
    return null
  }

  const pathLanguage = euLanguageMatch[1] as SupportedLanguages

  if (!Object.values(SupportedLanguages).includes(pathLanguage)) {
    return null
  }

  if (pathLanguage !== currentLanguageCookie) {
    return pathLanguage
  }

  return null
}
