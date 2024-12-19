import { SupportedLocale } from '@/intl/locales'

const LOCALE_FLAG_MAP: Record<SupportedLocale, string> = {
  [SupportedLocale.EN_US]: '🇺🇸',
  [SupportedLocale.EN_UK]: '🇬🇧',
}

export const getLocaleFlagEmoji = (locale: SupportedLocale): string => {
  return LOCALE_FLAG_MAP[locale]
}
