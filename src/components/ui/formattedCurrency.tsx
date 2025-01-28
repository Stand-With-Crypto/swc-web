import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

export function FormattedCurrency({
  amount,
  currencyCode,
  locale,
  ...otherProps
}: {
  amount: number
  currencyCode: string
  locale: SupportedLocale
} & Intl.NumberFormatOptions) {
  const response = intlNumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    ...otherProps,
  }).format(amount)
  return response
}
