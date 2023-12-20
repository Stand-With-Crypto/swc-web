import { SupportedCryptoCurrencyCodes, SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { faker } from '@faker-js/faker'

export const fakerFields = {
  id: () => faker.string.uuid(),
  dtsiSlug: () => 'vivek---ramaswamy', // TODO expand
  supportedFiatCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedFiatCurrencyCodes)),
  supportedCryptoCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedCryptoCurrencyCodes)),
}
