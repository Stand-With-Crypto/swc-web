import { COUNTRY_CODE_REGEX_PATTERN } from '@/utils/shared/supportedCountries'

export function extractCountryCodeFromPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  return COUNTRY_CODE_REGEX_PATTERN.test(firstSegment) ? firstSegment : null
}
