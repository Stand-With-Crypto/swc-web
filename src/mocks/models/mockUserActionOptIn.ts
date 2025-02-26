import { faker } from '@faker-js/faker'
import { Prisma, UserActionOptIn, UserActionOptInType } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionOptInInput() {
  return {
    optInType: faker.helpers.arrayElement(Object.values(UserActionOptInType)),
  } satisfies Prisma.UserActionOptInCreateInput
}

export function mockUserActionOptIn(): UserActionOptIn {
  return {
    ...mockCreateUserActionOptInInput(),
    id: fakerFields.id(),
  }
}
