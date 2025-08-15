import { SupportedLocale } from './supportedLocales'

export function compactNumber(
  value: number,
  locale: SupportedLocale = SupportedLocale.EN_US,
  options?: {
    maximumFractionDigits?: number
    minimumFractionDigits?: number
  },
): string {
  const { maximumFractionDigits = 1, minimumFractionDigits } = options || {}

  const validMinFractionDigits =
    minimumFractionDigits !== undefined && maximumFractionDigits !== undefined
      ? Math.min(minimumFractionDigits, maximumFractionDigits)
      : minimumFractionDigits

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits,
    minimumFractionDigits: validMinFractionDigits,
  }).format(value)
}
