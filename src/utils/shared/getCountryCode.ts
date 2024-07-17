import { NextRequest } from 'next/server'

import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const defaultCountryCode = ['local', 'testing'].includes(NEXT_PUBLIC_ENVIRONMENT)
  ? process.env.USER_COUNTRY_CODE || 'US'
  : 'unknown'

export const getCountryCode = (request: NextRequest) => {
  return request.geo?.country || defaultCountryCode
}

export const USER_COUNTRY_CODE_COOKIE_NAME = 'USER_COUNTRY_CODE'
