import { faker } from '@faker-js/faker'
import { Prisma, UserActionRefer } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionReferInput() {
  return {
    referralsCount: faker.number.int({ min: 1, max: 100 }),
  } satisfies Prisma.UserActionReferCreateInput
}

export function mockUserActionRefer(): UserActionRefer {
  return {
    ...mockCreateUserActionReferInput(),
    id: fakerFields.id(),
  }
}
