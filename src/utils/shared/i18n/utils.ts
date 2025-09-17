import {
  ORDERED_SUPPORTED_EU_LANGUAGES,
  SupportedEULanguages,
} from '@/utils/shared/supportedLocales'

export function isValidLanguage(value: string): value is SupportedEULanguages {
  return ORDERED_SUPPORTED_EU_LANGUAGES.includes(value as SupportedEULanguages)
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
export function extractLanguageFromPath(pathname: string): SupportedEULanguages | null {
  if (!pathname) return null

  // Regex to capture the /eu/[language] pattern
  const euRouteMatch = pathname.match(/^\/eu\/([a-z]{2})(?:\/|$)/)

  if (euRouteMatch) {
    const language = euRouteMatch[1]
    return isValidLanguage(language) ? language : null
  }

  return null
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
  const supportedLanguages = ORDERED_SUPPORTED_EU_LANGUAGES.join('|')
  const regex = new RegExp(`^/eu/(${supportedLanguages})(?:/|$)`)
  return regex.test(pathname)
}
