import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import {
  COUNTRY_CODE_REGEX_PATTERN,
  SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'

export async function getCountryCodeCookie() {
  const currentCookies = await cookies()

  const countryCode = currentCookies.get(SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME)?.value

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
