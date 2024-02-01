import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'
import { Prisma, UserActionOptIn, UserActionOptInType } from '@prisma/client'

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
