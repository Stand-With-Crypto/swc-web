import { SupportedLocale } from '@/intl/locales'

export function FormattedNumber({
  amount,
  locale,
  ...otherProps
}: {
  amount: number
  locale: SupportedLocale
} & {
  minimumIntegerDigits?: number | undefined
  minimumFractionDigits?: number | undefined
  maximumFractionDigits?: number | undefined
  minimumSignificantDigits?: number | undefined
  maximumSignificantDigits?: number | undefined
}) {
  const response = new Intl.NumberFormat(locale, {
    ...otherProps,
  }).format(amount)
  return response
}
