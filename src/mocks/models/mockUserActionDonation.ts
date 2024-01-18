import { fakerFields } from '@/mocks/fakerUtils'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { faker } from '@faker-js/faker'
import { DonationOrganization, UserActionDonation } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockUserActionDonation(): UserActionDonation {
  const amount = new Decimal(faker.number.float({ min: 0, max: 1000, precision: 0.01 }))
  const amountCurrencyCode = SupportedFiatCurrencyCodes.USD
  return {
    id: fakerFields.id(),
    amount,
    amountCurrencyCode,
    amountUsd: amount,
    recipient: faker.helpers.arrayElement(Object.values(DonationOrganization)),
  }
}
