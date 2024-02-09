import { renderHook } from '@testing-library/react'
import { expect, it } from '@jest/globals'

import { useNumeralArray } from '.'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'

const EDGE_CASES: [number, string[]][] = [
  [-124123, ['-$', '124', ',', '123']],
  [123, ['$', '123']],
  [0, ['$', '0']],
  [-0, ['-$', '0']],
  [Infinity, []],
  [-Infinity, []],
]

function formatCurrency(value: number, locale: SupportedLocale = SupportedLocale.EN_US) {
  return new Intl.NumberFormat(locale, {
    currency: SupportedFiatCurrencyCodes.USD,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

describe('useNumericalArray', () => {
  it('should return an array', () => {
    const { result } = renderHook(() => useNumeralArray(formatCurrency(2395081)))
    expect(result.current).toEqual(expect.any(Array))
  })

  it('should return a formatted string of the value divided by blocks', () => {
    const { result } = renderHook(() => useNumeralArray(formatCurrency(2395081)))
    expect(result.current).toEqual(['$', '2', ',', '395', ',', '081'])
  })

  it('should respect the locale passed as the second argument but keep the currency as USD', () => {
    const { result } = renderHook(() =>
      useNumeralArray(formatCurrency(2395081, SupportedLocale.ES)),
    )
    expect(result.current).toEqual(['2', '.', '395', '.', '081', expect.stringContaining('US$')])
  })

  it.each(EDGE_CASES)('should work normally with different values', (value, expected) => {
    const { result } = renderHook(() => useNumeralArray(formatCurrency(value)))
    expect(result.current).toEqual(expected)
  })
})
