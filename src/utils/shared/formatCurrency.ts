import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

export function formatCurrency(
  value: number,
  {
    locale,
    maximumFractionDigits,
    notation,
  }: {
    locale: SupportedLocale
    maximumFractionDigits: number
    notation: Intl.NumberFormatOptions['notation']
  } = {
    locale: SupportedLocale.EN_US,
    maximumFractionDigits: 0,
    notation: 'standard',
  },
) {
  return intlNumberFormat(locale, {
    style: 'currency',
    currency: SupportedFiatCurrencyCodes.USD,
    maximumFractionDigits,
    notation,
  }).format(value)
}
