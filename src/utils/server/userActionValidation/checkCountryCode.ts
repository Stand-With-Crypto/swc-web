import 'server-only'

import { cookies } from 'next/headers'

import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'

export const checkCountryCode = async (countryCode: string) => {
  const userCountryCode = cookies().get(USER_COUNTRY_CODE_COOKIE_NAME)?.value
  return userCountryCode === countryCode
}

export function createCountryCodeValidation(requiredCountryCode: string) {
  return async () => {
    const isValid = await checkCountryCode(requiredCountryCode)
    if (!isValid) {
      return {
        errors: {
          actionUnavailable: [
            `Actions on Stand With Crypto are only available to users based in the ${requiredCountryCode}.`,
          ],
        },
      }
    }

    return
  }
}
