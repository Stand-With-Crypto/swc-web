import Cookies from 'js-cookie'

import {
  parseUserCountryCodeCookie,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { isBrowser } from '@/utils/shared/executionEnvironment'

export function getCountryCodeForClientAnalytics() {
  if (!isBrowser) return ''

  const maybeCountryCodeCookie = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)

  const countryCode = parseUserCountryCodeCookie(maybeCountryCodeCookie)?.countryCode ?? null

  if (!countryCode) {
    return 'not-set'
  }

  return countryCode
}
