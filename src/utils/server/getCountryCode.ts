import * as Sentry from '@sentry/nextjs'
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

export const parseUserCountryCodeCookie = (cookieValue?: string | null) => {
  if (!cookieValue) {
    return null
  }

  let parsedCookieValue: UserCountryCodeCookie | null = null

  try {
    if (cookieValue.includes('{')) {
      parsedCookieValue = JSON.parse(cookieValue) as UserCountryCodeCookie
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { domain: 'parseUserCountryCodeCookie' },
      extra: {
        cookieValue,
      },
    })
    return null
  }

  const countryCode = (parsedCookieValue?.countryCode || cookieValue)?.toLowerCase()

  return parsedCookieValue
    ? {
        ...parsedCookieValue,
        countryCode,
      }
    : { countryCode, bypassed: false }
}
