import { useLocale } from '@/hooks/useLocale'
import { getIntlUrls } from '@/utils/shared/urls'
import { useMemo } from 'react'

export function useInternalUrls() {
  const locale = useLocale()

  return useMemo(() => getIntlUrls(locale), [locale])
}
