import { faker } from '@faker-js/faker'

import { mockValidPhoneNumber } from '@/mocks/mockValidPhoneNumber'
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
  phoneNumber: mockValidPhoneNumber,
  stateCode: (options?: { abbreviated?: boolean }) => faker.location.state(options),
  usCongressionalDistrict: () => faker.number.int({ min: 1, max: 20 }).toString(),
  electoralZone: () => faker.number.int({ min: 1, max: 20 }).toString(),
  generateReferralId: () => faker.string.uuid().slice(0, 12),
}
