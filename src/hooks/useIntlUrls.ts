/*
Utility for accessing internal urls from context in client components

NOTE: Do not convert a SSR component to a client component just to use this hook. 
Instead, use getIntlUrls directly passing the locale from the request params
*/

import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useMemo } from 'react'

export function useIntlUrls() {
  const locale = useLocale()

  return useMemo(() => getIntlUrls(locale), [locale])
}
