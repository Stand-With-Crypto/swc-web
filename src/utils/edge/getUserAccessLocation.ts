import { geolocation } from '@vercel/functions'
import { NextRequest } from 'next/server'

import { extractCountryCodeFromPathname } from '@/utils/server/extractCountryCodeFromPathname'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME } from '@/utils/shared/userAccessLocation'

const defaultDevAccessLocation = ['local', 'testing'].includes(NEXT_PUBLIC_ENVIRONMENT)
  ? process.env.USER_ACCESS_LOCATION
  : ''

export function getUserAccessLocation(request: NextRequest) {
  const { country: userCountryCode } = geolocation(request)

  const overrideUserAccessLocationCookie = request.cookies.get(
    OVERRIDE_USER_ACCESS_LOCATION_COOKIE_NAME,
  )?.value

  const pageCountryCode =
    extractCountryCodeFromPathname(request.nextUrl.pathname)?.toLowerCase() ??
    DEFAULT_SUPPORTED_COUNTRY_CODE

  return (
    overrideUserAccessLocationCookie ||
    userCountryCode ||
    defaultDevAccessLocation ||
    pageCountryCode
  )
}
