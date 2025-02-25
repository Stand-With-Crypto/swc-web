import * as Sentry from '@sentry/nextjs'
import Cookies from 'js-cookie'

import {
  COUNTRY_CODE_REGEX_PATTERN,
  SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'

export function getCountryCodeOnClient() {
  const countryCode = Cookies.get(SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME)

  if (!countryCode) {
    const error = new Error('Country code cookie not found on client')
    Sentry.captureException(error, { tags: { countryCode } })
    throw error
  }

  if (!COUNTRY_CODE_REGEX_PATTERN.test(countryCode)) {
    const error = new Error('Found invalid country code cookie on client.')
    Sentry.captureException(error, { tags: { countryCode } })
    throw error
  }

  return countryCode
}
