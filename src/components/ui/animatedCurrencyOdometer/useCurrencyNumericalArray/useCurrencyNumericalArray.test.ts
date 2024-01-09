import { renderHook } from '@testing-library/react'

import { useCurrencyNumeralArray } from './'
import { SupportedLocale } from '@/intl/locales'

const EDGE_CASES: [number, string[]][] = [
  [-124123, ['-$', '124', ',', '123']],
  [123, ['$', '123']],
  [0, ['$', '0']],
  [-0, ['-$', '0']],
  [Infinity, []],
  [-Infinity, []],
]

describe('useCurrencyNumeralArray', () => {
  it('should return an array', () => {
    const { result } = renderHook(() => useCurrencyNumeralArray(2395081))
    expect(result.current).toEqual(expect.any(Array))
  })

  it('should return a formatted string of the value divided by blocks', () => {
    const { result } = renderHook(() => useCurrencyNumeralArray(2395081))
    expect(result.current).toEqual(['$', '2', ',', '395', ',', '081'])
  })

  it('should respect the locale passed as the second argument but keep the currency as USD', () => {
    const { result } = renderHook(() => useCurrencyNumeralArray(2395081, SupportedLocale.ES))
    expect(result.current).toEqual(['2', '.', '395', '.', '081', expect.stringContaining('US$')])
  })

  it.each(EDGE_CASES)('should work normally with different values', (value, expected) => {
    const { result } = renderHook(() => useCurrencyNumeralArray(value))
    expect(result.current).toEqual(expected)
  })
})
