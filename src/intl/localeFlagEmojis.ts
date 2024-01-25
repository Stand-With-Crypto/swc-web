import { SupportedLocale } from '@/intl/locales'

const LOCALE_FLAG_MAP: Record<SupportedLocale, string> = {
  [SupportedLocale.EN_US]: '🇺🇸',
  [SupportedLocale.ES]: '🇪🇸',
}

export function getLocaleFlagEmoji(locale: SupportedLocale): string {
  return LOCALE_FLAG_MAP[locale]
}
