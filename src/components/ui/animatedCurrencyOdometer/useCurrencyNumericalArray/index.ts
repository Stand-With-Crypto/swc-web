import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { useMemo } from 'react'

const FORMATTED_CURRENCY_BLOCK_REGEX = /(\D+)?(\d+)(\D+)?(\d+)?(\D+)?(\d+)?(\D+)?/

export function useCurrencyNumeralArray(value: number, locale = SupportedLocale.EN_US) {
  const formattedValue = useMemo(() => {
    return formatCurrency(value, locale)
  }, [locale, value])

  /**
   * @description numeralArray uses regex to split the donation value into an array of strings.
   * @example // $2,395,081 => ["$", "2", ",", "395", ",", "081"]
   */
  const numeralArray = useMemo(() => {
    const rgxExecArray = FORMATTED_CURRENCY_BLOCK_REGEX.exec(formattedValue)

    if (rgxExecArray) {
      const arrayValue = [...rgxExecArray]
      arrayValue.shift()

      return arrayValue.filter(val => val)
    }

    return []
  }, [formattedValue])

  return numeralArray
}

function formatCurrency(value: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: SupportedFiatCurrencyCodes.USD,
    maximumFractionDigits: 0,
  }).format(value)
}
