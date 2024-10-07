import 'server-only'

import { cookies } from 'next/headers'

import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { UserActionValidationErrors } from '@/utils/server/userActionValidation/constants'
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

export function createCountryCodeValidation(requiredCountryCode: string) {
  return async () => {
    const userCountryCode = cookies().get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

    if (!isValidCountryCode({ countryCode: requiredCountryCode, userCountryCode })) {
      return {
        errors: {
          [UserActionValidationErrors.ACTION_UNAVAILABLE]: [
            `Actions on Stand With Crypto are only available to users based in the ${requiredCountryCode}.`,
          ],
        },
      }
    }

    return
  }
}
