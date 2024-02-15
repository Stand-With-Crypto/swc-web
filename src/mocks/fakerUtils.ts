import { faker } from '@faker-js/faker'

import dtsiSlugs from '@/staticContent/dtsi/testingDtsiSlugs.json'
import { SupportedCryptoCurrencyCodes, SupportedFiatCurrencyCodes } from '@/utils/shared/currency'

export const fakerFields = {
  id: () => faker.string.uuid(),
  dtsiStanceScore: () => faker.number.int({ min: 0, max: 100 }),
  dtsiSlug: () => faker.helpers.arrayElement(dtsiSlugs),
  supportedFiatCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedFiatCurrencyCodes)),
  supportedCryptoCurrencyCode: () =>
    faker.helpers.arrayElement(Object.values(SupportedCryptoCurrencyCodes)),
  phoneNumber: () => faker.helpers.fromRegExp('+1[0-9]{10}'),
  usaState: () => faker.location.state(),
  generateReferralId: () => faker.string.uuid().slice(0, 12),
}
