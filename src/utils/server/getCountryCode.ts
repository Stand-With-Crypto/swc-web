import { geolocation } from '@vercel/functions'
import { NextRequest } from 'next/server'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const USER_COUNTRY_CODE_COOKIE_NAME = 'USER_COUNTRY_CODE'

interface UserCountryCodeCookie {
  countryCode: string
  bypassed: boolean
}

const defaultCountryCode = ['local', 'testing'].includes(NEXT_PUBLIC_ENVIRONMENT)
  ? process.env.USER_COUNTRY_CODE || DEFAULT_SUPPORTED_COUNTRY_CODE
  : ''

export const getCountryCode = (request: NextRequest) => {
  const { country: userCountryCode } = geolocation(request)

  return userCountryCode || defaultCountryCode
}

export const parseUserCountryCodeCookie = (cookieValue?: string) => {
  if (!cookieValue) {
    return null
  }

  return cookieValue?.includes('{')
    ? (JSON.parse(cookieValue) as UserCountryCodeCookie)
    : { countryCode: cookieValue, bypassed: false }
}
