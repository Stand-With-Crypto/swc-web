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
  // https://stackoverflow.com/a/41045289
  if (
    otherProps.maximumFractionDigits !== undefined &&
    otherProps.minimumFractionDigits === undefined
  ) {
    otherProps.minimumFractionDigits = otherProps.maximumFractionDigits
  }
  const response = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    ...otherProps,
  }).format(amount)
  return response
}
