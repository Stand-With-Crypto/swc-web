import 'server-only'

import { cookies } from 'next/headers'

import { UserActionValidationErrors } from '@/utils/server/userActionValidation/constants'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

export function createCountryCodeValidation(
  allowedCountryCodes:
    | SupportedCountryCodes
    | SupportedCountryCodes[] = DEFAULT_SUPPORTED_COUNTRY_CODE,
) {
  return async () => {
    const allowedCountryCodesArray = Array.isArray(allowedCountryCodes)
      ? allowedCountryCodes
      : [allowedCountryCodes]

    const currentCookies = await cookies()
    const userAccessLocation = currentCookies
      .get(USER_ACCESS_LOCATION_COOKIE_NAME)
      ?.value?.toLowerCase()

    const isValidCountryCodeResults = allowedCountryCodesArray.map(countryCode =>
      isValidCountryCode({ countryCode, userAccessLocation }),
    )

    if (isValidCountryCodeResults.every(result => !result)) {
      return {
        errors: {
          [UserActionValidationErrors.ACTION_UNAVAILABLE]: [
            `This action is not available on your geographic location.`,
          ],
        },
      }
    }

    return
  }
}
