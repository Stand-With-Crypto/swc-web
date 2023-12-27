import { SupportedCryptoCurrencyCodes, SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { faker } from '@faker-js/faker'
import dtsiSlugs from '@/staticContent/mocks/dtsiSlugs.json'

export const fakerFields = {
  id: () => faker.string.uuid(),
  dtsiSlug: () => faker.helpers.arrayElement(dtsiSlugs),
  supportedFiatCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedFiatCurrencyCodes)),
  supportedCryptoCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedCryptoCurrencyCodes)),
}
