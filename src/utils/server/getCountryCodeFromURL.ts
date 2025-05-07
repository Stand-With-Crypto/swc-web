import { headers } from 'next/headers'

import { extractCountryCodeFromPathname } from '@/utils/server/extractCountryCodeFromPathname'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

export async function getCountryCodeFromHeaders(
  headersListArg?: Awaited<ReturnType<typeof headers>>,
) {
  const headersList = headersListArg ?? (await headers())

  const referer = headersList.get('referer')
  const xMatchedPath = headersList.get('x-matched-path')

  const countryCode =
    extractCountryCodeFromPathname(xMatchedPath || '') ||
    extractCountryCodeFromPathname(getPathnameFromReferer(referer))

  const validatedCountryCode = zodSupportedCountryCode.safeParse(countryCode)
  return validatedCountryCode.success ? validatedCountryCode.data : DEFAULT_SUPPORTED_COUNTRY_CODE
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
