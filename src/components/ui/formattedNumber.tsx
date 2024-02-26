import { SupportedLocale } from '@/intl/locales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

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
  const response = intlNumberFormat(locale, {
    ...otherProps,
  }).format(amount)
  return response
}
