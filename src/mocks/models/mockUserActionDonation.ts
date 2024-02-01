import { fakerFields } from '@/mocks/fakerUtils'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { faker } from '@faker-js/faker'
import { DonationOrganization, Prisma, UserActionDonation } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export function mockCreateUserActionDonationInput() {
  const amount = new Decimal(faker.number.float({ min: 0, max: 1000, precision: 0.01 }))
  const amountCurrencyCode = SupportedFiatCurrencyCodes.USD
  return {
    amount,
    amountCurrencyCode,
    amountUsd: amount,
    recipient: faker.helpers.arrayElement(Object.values(DonationOrganization)),
  } satisfies Prisma.UserActionDonationCreateInput
}

export function mockUserActionDonation(): UserActionDonation {
  return {
    id: fakerFields.id(),
    ...mockCreateUserActionDonationInput(),
  }
}
