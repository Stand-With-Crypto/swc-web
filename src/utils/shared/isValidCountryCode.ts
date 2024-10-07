import { parseUserCountryCodeCookie } from '@/utils/server/getCountryCode'
import { SUPPORTED_COUNTRY_CODES } from '@/utils/shared/supportedCountries'

type IsValidCountryCodeArgs = {
  countryCode: string
  userCountryCode?: string
  bypassCountryCheck?: boolean
}

export function isValidCountryCode({
  countryCode,
  userCountryCode,
  bypassCountryCheck,
}: IsValidCountryCodeArgs) {
  if (bypassCountryCheck) return true

  const parsedExistingCountryCode = parseUserCountryCodeCookie(userCountryCode)
  // we want to avoid blocking content in situations where a users IP isn't set for some reason
  if (!parsedExistingCountryCode?.countryCode) return true
  if (parsedExistingCountryCode.countryCode === countryCode) return true
  // there are cases where users in the US are getting blocked if they are close to the US border so we want to be more permissive with Canada/Mexico
  if (
    countryCode === SUPPORTED_COUNTRY_CODES.US &&
    ['MX', 'CA'].includes(parsedExistingCountryCode.countryCode)
  ) {
    return true
  }

  return false
}
