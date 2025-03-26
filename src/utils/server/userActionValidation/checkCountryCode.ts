import 'server-only'

import { cookies } from 'next/headers'

import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { UserActionValidationErrors } from '@/utils/server/userActionValidation/constants'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

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
    const userCountryCode = currentCookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

    const isValidCountryCodeResults = allowedCountryCodesArray.map(countryCode =>
      isValidCountryCode({ countryCode, userCountryCode }),
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
