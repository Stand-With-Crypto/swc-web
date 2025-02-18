import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import { SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME } from '@/utils/shared/supportedCountries'

// Two lowercase letters (e.g., "us", "uk")
const COUNTRY_CODE_PATTERN = /^[a-z]{2}$/

export async function getTenantId() {
  try {
    const currentCookies = await cookies()
    const tenantId = currentCookies.get(SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME)?.value

    if (!tenantId) {
      throw new Error('Tenant ID cookie not found')
    }

    if (!COUNTRY_CODE_PATTERN.test(tenantId)) {
      throw new Error('Invalid Tenant ID cookie')
    }

    return tenantId
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
}
