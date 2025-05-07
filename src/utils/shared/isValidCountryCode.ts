import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface IsValidCountryCodeArgs {
  countryCode: string
  userAccessLocation?: string
  bypassCountryCheck?: boolean
}

export function isValidCountryCode({
  countryCode,
  userAccessLocation,
  bypassCountryCheck,
}: IsValidCountryCodeArgs) {
  if (bypassCountryCheck) return true

  if (userAccessLocation === countryCode) return true
  // there are cases where users in the US are getting blocked if they are close to the US border so we want to be more permissive with Canada/Mexico
  if (
    countryCode === SupportedCountryCodes.US &&
    userAccessLocation &&
    ['mx', 'ca'].includes(userAccessLocation)
  ) {
    return true
  }

  return false
}
