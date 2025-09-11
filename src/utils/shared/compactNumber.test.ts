import { describe, expect, it } from '@jest/globals'

import { compactNumber } from './compactNumber'
import { SupportedLocale } from './supportedLocales'

describe('compactNumber', () => {
  it('should format numbers below 1K without abbreviation', () => {
    expect(compactNumber(999)).toBe('999')
    expect(compactNumber(500)).toBe('500')
    expect(compactNumber(1)).toBe('1')
  })

  it('should format thousands with K abbreviation', () => {
    expect(compactNumber(1000)).toBe('1K')
    expect(compactNumber(1500)).toBe('1.5K')
    expect(compactNumber(10000)).toBe('10K')
    expect(compactNumber(58209)).toBe('58.2K')
    expect(compactNumber(100000)).toBe('100K')
  })

  it('should format millions with M abbreviation', () => {
    expect(compactNumber(1000000)).toBe('1M')
    expect(compactNumber(1500000)).toBe('1.5M')
    expect(compactNumber(2340000)).toBe('2.3M')
    expect(compactNumber(10000000)).toBe('10M')
  })

  it('should format billions with B abbreviation', () => {
    expect(compactNumber(1000000000)).toBe('1B')
    expect(compactNumber(1500000000)).toBe('1.5B')
    expect(compactNumber(2340000000)).toBe('2.3B')
  })

  it('should respect maximumFractionDigits option', () => {
    expect(compactNumber(1234, SupportedLocale.EN_US, { maximumFractionDigits: 0 })).toBe('1K')
    expect(compactNumber(1234, SupportedLocale.EN_US, { maximumFractionDigits: 2 })).toBe('1.23K')
    expect(compactNumber(1560000, SupportedLocale.EN_US, { maximumFractionDigits: 0 })).toBe('2M')
    expect(compactNumber(1560000, SupportedLocale.EN_US, { maximumFractionDigits: 2 })).toBe(
      '1.56M',
    )
  })

  it('should work with different locales', () => {
    // Only EN_US is supported currently
    expect(compactNumber(1500, SupportedLocale.EN_US)).toBe('1.5K')
  })

  it('should handle zero and negative numbers', () => {
    expect(compactNumber(0)).toBe('0')
    expect(compactNumber(-1000)).toBe('-1K')
    expect(compactNumber(-1500000)).toBe('-1.5M')
  })

  it('should handle decimal inputs', () => {
    expect(compactNumber(1500.7)).toBe('1.5K')
    expect(compactNumber(999.9)).toBe('999.9') // doesn't round up to 1K
  })

  it('should use default locale when none provided', () => {
    expect(compactNumber(1500)).toBe('1.5K')
  })

  it('should respect minimumFractionDigits option', () => {
    expect(
      compactNumber(1000, SupportedLocale.EN_US, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    ).toBe('1.0K')
    expect(
      compactNumber(2000000, SupportedLocale.EN_US, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ).toBe('2.00M')
  })
})
