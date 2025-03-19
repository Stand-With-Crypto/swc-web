import { headers } from 'next/headers'

import { extractCountryCode } from '@/utils/server/obfuscateURLCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const getCountryCodeFromURL = async () => {
  const headersList = await headers()

  const referer = headersList.get('referer')
  const xMatchedPath = headersList.get('x-matched-path')

  const countryCode = extractCountryCode(xMatchedPath || '') || extractCountryCode(referer || '')

  return countryCode || DEFAULT_SUPPORTED_COUNTRY_CODE
}
