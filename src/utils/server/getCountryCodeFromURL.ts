import { headers } from 'next/headers'

import { extractCountryCodeFromPathname } from '@/utils/server/middleware/extractCountryCodeFromPathname'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export const getCountryCodeFromURL = async () => {
  const headersList = await headers()

  const referer = headersList.get('referer')
  const xMatchedPath = headersList.get('x-matched-path')

  const countryCode =
    extractCountryCodeFromPathname(xMatchedPath || '') ||
    extractCountryCodeFromPathname(referer || '')

  return countryCode || DEFAULT_SUPPORTED_COUNTRY_CODE
}
