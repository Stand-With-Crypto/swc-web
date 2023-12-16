import { SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'

it('includes all locales in SUPPORTED_LOCALES', () => {
  expect(Object.values(SupportedLocale).sort()).toEqual([...SUPPORTED_LOCALES].sort())
})
