import 'server-only'

import { cookies } from 'next/headers'

import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { UserActionValidationErrors } from '@/utils/server/userActionValidation/constants'

import { isValidCountryCode } from './isValidCountryCode'

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
