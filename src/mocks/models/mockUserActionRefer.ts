import { faker } from '@faker-js/faker'
import { Prisma, UserActionRefer } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionReferInput() {
  return {
    referralsCount: faker.number.int({ min: 0, max: 100 }),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Prisma.UserActionReferCreateInput
}

export function mockUserActionRefer(): UserActionRefer {
  return {
    ...mockCreateUserActionReferInput(),
    id: fakerFields.id(),
  }
}
