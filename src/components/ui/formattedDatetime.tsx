import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'

export function FormattedDatetime({
  date,
  locale,
  ...otherProps
}: {
  date: Date
  locale: SupportedLocale
} & Intl.DateTimeFormatOptions) {
  const response = new Intl.DateTimeFormat(locale, {
    ...otherProps,
  }).format(date)
  return response
}
