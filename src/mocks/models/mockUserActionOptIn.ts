import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'
import { UserActionOptIn, UserActionOptInType } from '@prisma/client'

export function mockUserActionOptIn(): UserActionOptIn {
  return {
    id: fakerFields.id(),
    optInType: faker.helpers.arrayElement(Object.values(UserActionOptInType)),
  }
}
