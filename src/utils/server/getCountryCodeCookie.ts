import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { COUNTRY_CODE_REGEX_PATTERN } from '@/utils/shared/supportedCountries'

interface GetCountryCodeCookieProps {
  bypassValidCountryCodeCheck?: boolean
}

export async function getCountryCodeCookie({
  bypassValidCountryCodeCheck,
}: GetCountryCodeCookieProps = {}) {
  const currentCookies = await cookies()

  const maybeCountryCodeCookie = currentCookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

  const countryCode = parseUserCountryCodeCookie(maybeCountryCodeCookie)?.countryCode ?? null

  if (!countryCode) {
    const error = new Error('Country Code cookie not found')
    Sentry.captureException(error, { tags: { countryCode } })
    throw error
  }

  if (bypassValidCountryCodeCheck) {
    const isValidFormat = /^[a-z]{2}$/.test(countryCode)

    if (!isValidFormat) {
      const error = new Error('Invalid Country Code cookie format.')
      Sentry.captureException(error, { tags: { countryCode } })
      throw error
    }

    return countryCode
  }

  if (!COUNTRY_CODE_REGEX_PATTERN.test(countryCode)) {
    const error = new Error('Invalid Country Code cookie.')
    Sentry.captureException(error, { tags: { countryCode } })
    throw error
  }

  return countryCode
}
