/*
Utility for accessing internal urls from context in client components

NOTE: Do not convert a SSR component to a client component just to use this hook.
Instead, use getIntlUrls directly passing the countryCode from the request params
*/

import { useMemo } from 'react'

import { useCountryCode } from '@/hooks/useCountryCode'
import { getIntlUrls } from '@/utils/shared/urls'
import { useLanguage } from '@/utils/web/i18n/useLanguage'

export function useIntlUrls() {
  const countryCode = useCountryCode()
  const language = useLanguage()

  return useMemo(() => getIntlUrls(countryCode, { language }), [countryCode, language])
}
