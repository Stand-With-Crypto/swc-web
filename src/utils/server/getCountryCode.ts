import { NextRequest } from 'next/server'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const USER_COUNTRY_CODE_COOKIE_NAME = 'USER_COUNTRY_CODE'

const defaultCountryCode = ['local', 'testing'].includes(NEXT_PUBLIC_ENVIRONMENT)
  ? process.env.USER_COUNTRY_CODE || DEFAULT_SUPPORTED_COUNTRY_CODE
  : ''

export const getCountryCode = (request: NextRequest) => {
  const userCountryCode = request.geo?.country

  return userCountryCode || defaultCountryCode
}
