'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const LOCALE_LABELS: Record<SupportedLocale, { label: string; flag: string }> = {
  [SupportedLocale.EN_US]: { label: 'English', flag: '🇺🇸' },
  [SupportedLocale.FR_CA]: { label: 'French', flag: '🇫🇷' },
}

export function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLanguage()

  // Don't show switcher if only one language is available
  if (availableLocales.length <= 1) {
    return null
  }

  return (
    <Select onValueChange={setLocale} value={locale}>
      <SelectTrigger className="w-auto min-w-[120px]">
        <div className="flex items-center gap-2">
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {availableLocales.map(localeOption => (
          <SelectItem key={localeOption} value={localeOption}>
            <div className="flex items-center gap-2">
              <span>{LOCALE_LABELS[localeOption].flag}</span>
              <span>{LOCALE_LABELS[localeOption].label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
