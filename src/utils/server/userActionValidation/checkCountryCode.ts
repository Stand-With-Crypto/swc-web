import 'server-only'

import { cookies } from 'next/headers'

import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { UserActionValidationErrors } from '@/utils/server/userActionValidation/constants'

const checkCountryCode = async (countryCode: string) => {
  const userCountryCode = cookies().get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

  const parsedExistingCountryCode = parseUserCountryCodeCookie(userCountryCode)
  return parsedExistingCountryCode?.countryCode === countryCode
}

export function createCountryCodeValidation(requiredCountryCode: string) {
  return async () => {
    const isValid = await checkCountryCode(requiredCountryCode)
    if (!isValid) {
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
