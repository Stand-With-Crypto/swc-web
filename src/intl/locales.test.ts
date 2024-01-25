import { ORDERED_SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'
import { expect } from '@jest/globals'

it('includes all locales in ORDERED_SUPPORTED_LOCALES', () => {
  expect(Object.values(SupportedLocale).sort()).toEqual([...ORDERED_SUPPORTED_LOCALES].sort())
})
