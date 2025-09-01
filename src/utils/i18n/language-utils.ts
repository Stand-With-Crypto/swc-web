import { headers } from 'next/headers'

import type { SupportedLanguage } from './types'

export function isValidLanguage(value: string): value is SupportedLanguage {
  return ['en', 'de', 'fr'].includes(value)
}

/**
 * Extracts locale from a pathname
 * Supports the /eu/[language] pattern (e.g.: /eu/de, /eu/fr)
 *
 * @param pathname - The URL pathname (e.g.: "/eu/de/some/path")
 * @returns SupportedLocale or null if not found
 *
 * @example
 * extractLanguageFromPath('/eu/de') // 'de'
 * extractLanguageFromPath('/eu/fr/some/path') // 'fr'
 * extractLanguageFromPath('/other/path') // null
 * extractLanguageFromPath('/eu') // null (no specific language)
 */
export function extractLanguageFromPath(pathname: string): SupportedLanguage | null {
  if (!pathname) return null

  // Regex to capture the /eu/[language] pattern
  const euRouteMatch = pathname.match(/^\/eu\/([a-z]{2})(?:\/|$)/)

  if (euRouteMatch) {
    const language = euRouteMatch[1]
    return isValidLanguage(language) ? language : null
  }

  return null
}

export async function getServerLocale(): Promise<SupportedLanguage> {
  try {
    const headersList = await headers()

    const pathname =
      headersList.get('x-pathname') ||
      headersList.get('x-invoke-path') ||
      headersList.get('referer')?.replace(/^https?:\/\/[^/]+/, '') ||
      ''

    const routeLanguage = extractLanguageFromPath(pathname)
    if (routeLanguage) {
      return routeLanguage
    }
    return 'en'
  } catch (error) {
    console.warn('Failed to determine server language:', error)
    return 'en'
  }
}

/**
 * Checks if a route is a localized route (/eu/[language] pattern)
 *
 * @param pathname - The pathname to check
 * @returns true if it's a localized route
 *
 * @example
 * isLocalizedRoute('/eu/de/about') // true
 * isLocalizedRoute('/eu/fr') // true
 * isLocalizedRoute('/regular/path') // false
 */
export function isLocalizedRoute(pathname: string): boolean {
  return /^\/eu\/[a-z]{2}(?:\/|$)/.test(pathname)
}
