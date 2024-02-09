import { SupportedCryptoCurrencyCodes, SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { faker } from '@faker-js/faker'
import dtsiSlugs from '@/staticContent/dtsi/testingDtsiSlugs.json'

export const fakerFields = {
  dtsiSlug: () => faker.helpers.arrayElement(dtsiSlugs),
  dtsiStanceScore: () => faker.number.int({ max: 100, min: 0 }),
  id: () => faker.string.uuid(),
  phoneNumber: () => faker.helpers.fromRegExp('+1[0-9]{10}'),
  supportedCryptoCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedCryptoCurrencyCodes)),
  supportedFiatCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedFiatCurrencyCodes)),
}
