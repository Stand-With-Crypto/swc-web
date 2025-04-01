import { headers } from 'next/headers'

import { extractCountryCode } from '@/utils/server/obfuscateURLCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export async function getCountryCodeFromHeaders() {
  const headersList = await headers()

  const referer = headersList.get('referer')
  const xMatchedPath = headersList.get('x-matched-path')

  const countryCode =
    extractCountryCode(xMatchedPath || '') || extractCountryCode(getPathnameFromReferer(referer))

  return countryCode || DEFAULT_SUPPORTED_COUNTRY_CODE
}

function getPathnameFromReferer(referer: string | null) {
  if (!referer) {
    return ''
  }

  if (referer.startsWith('/')) {
    return referer
  }

  const url = new URL(referer)
  return url.pathname
}
