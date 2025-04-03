import Cookies from 'js-cookie'

import { isBrowser } from '@/utils/shared/executionEnvironment'
import { USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

export function getCountryCodeForClientAnalytics() {
  if (!isBrowser) return ''

  const maybeUserAccessLocationCookie = Cookies.get(USER_ACCESS_LOCATION_COOKIE_NAME)?.toLowerCase()

  if (!maybeUserAccessLocationCookie) {
    return 'not-set'
  }

  return maybeUserAccessLocationCookie
}
