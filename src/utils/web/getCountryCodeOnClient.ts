import Cookies from 'js-cookie'

import { isBrowser } from '@/utils/shared/executionEnvironment'
import { SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME } from '@/utils/shared/supportedCountries'

export function getCountryCodeOnClient() {
  if (!isBrowser) return ''

  const countryCode = Cookies.get(SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME)

  if (!countryCode) {
    return 'not-set'
  }

  return countryCode
}
