import { SupportedLocale } from '@/intl/locales'

export function FormattedCurrency({
  amount,
  currencyCode,
  locale,
  ...otherProps
}: {
  amount: number
  currencyCode: string
  locale: SupportedLocale
} & {
  currencySign?: string | undefined
  useGrouping?: boolean | undefined
  minimumIntegerDigits?: number | undefined
  minimumFractionDigits?: number | undefined
  maximumFractionDigits?: number | undefined
  minimumSignificantDigits?: number | undefined
  maximumSignificantDigits?: number | undefined
}) {
  const response = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    ...otherProps,
  }).format(amount)
  return response
}
