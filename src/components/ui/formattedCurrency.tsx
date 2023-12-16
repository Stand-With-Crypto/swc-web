import { SupportedLocale } from '@/intl/locales'
import { SupportedCurrencyCodes } from '@/utils/shared/currency'

export function FormattedCurrency({
  amount,
  currencyCode,
  locale,
}: {
  amount: number
  currencyCode: SupportedCurrencyCodes
  locale: SupportedLocale
}) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount)
}
