import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import {
  COUNTRY_CODE_REGEX_PATTERN,
  SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'

export async function getTenantId() {
  try {
    const currentCookies = await cookies()
    const tenantId = currentCookies.get(SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME)?.value

    if (!tenantId) {
      throw new Error('Tenant ID cookie not found')
    }

    if (!COUNTRY_CODE_REGEX_PATTERN.test(tenantId)) {
      throw new Error('Invalid Tenant ID cookie')
    }

    return tenantId
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
