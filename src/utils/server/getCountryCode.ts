import { NextRequest } from 'next/server'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const defaultCountryCode = ['local', 'testing'].includes(NEXT_PUBLIC_ENVIRONMENT)
  ? process.env.USER_COUNTRY_CODE || DEFAULT_SUPPORTED_COUNTRY_CODE
  : undefined

export const getCountryCode = (request: NextRequest) => {
  const existingCountryCode = request.cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)?.value

  return request.geo?.country || existingCountryCode || defaultCountryCode
}

export const USER_COUNTRY_CODE_COOKIE_NAME = 'USER_COUNTRY_CODE'
