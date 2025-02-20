import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'

import {
  COUNTRY_CODE_REGEX_PATTERN,
  SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'

export async function getTenantId() {
  const currentCookies = await cookies()

  const tenantId = currentCookies.get(SWC_CURRENT_PAGE_COUNTRY_CODE_COOKIE_NAME)?.value

  if (!tenantId) {
    const error = new Error('Tenant ID cookie not found')
    Sentry.captureException(error, { tags: { tenantId } })
    throw error
  }

  if (!COUNTRY_CODE_REGEX_PATTERN.test(tenantId)) {
    const error = new Error('Invalid Tenant ID cookie.')
    Sentry.captureException(error, { tags: { tenantId } })
    throw error
  }

  return tenantId
}
