import { usePathname } from 'next/navigation'

import { extractLanguageFromPath } from '@/utils/shared/i18n/utils'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export function useLanguage() {
  const pathname = usePathname()
  return extractLanguageFromPath(pathname ?? '') as SupportedLanguages
}
