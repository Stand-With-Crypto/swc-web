/*
Utility for accessing internal urls from context in client components

NOTE: Do not convert a SSR component to a client component just to use this hook.
Instead, use getIntlUrls directly passing the locale from the request params
*/

import { useMemo } from 'react'

import { useCountryCode } from '@/hooks/useCountryCode'
import { getIntlUrls } from '@/utils/shared/urls'

export function useIntlUrls() {
  const countryCode = useCountryCode()

  return useMemo(() => getIntlUrls(countryCode), [countryCode])
}
