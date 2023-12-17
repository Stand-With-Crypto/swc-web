import { ORDERED_SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'

it('includes all locales in ORDERED_SUPPORTED_LOCALES', () => {
  expect(Object.values(SupportedLocale).sort()).toEqual([...ORDERED_SUPPORTED_LOCALES].sort())
})
