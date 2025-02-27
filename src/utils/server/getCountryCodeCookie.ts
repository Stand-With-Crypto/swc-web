import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { COUNTRY_CODE_REGEX_PATTERN } from '@/utils/shared/supportedCountries'

export async function getCountryCodeCookie() {
  const currentCookies = await cookies()

  const maybeCountryCodeCookie = currentCookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

  const countryCode = parseUserCountryCodeCookie(maybeCountryCodeCookie)?.countryCode ?? null

  if (!countryCode) {
    const error = new Error('Country Code cookie not found')
    Sentry.captureException(error, { tags: { countryCode } })
    throw error
  }

  if (!COUNTRY_CODE_REGEX_PATTERN.test(countryCode)) {
    const error = new Error('Invalid Country Code cookie.')
    Sentry.captureException(error, { tags: { countryCode } })
    throw error
  }

  return countryCode
}
