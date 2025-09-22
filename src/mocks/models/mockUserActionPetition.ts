import { faker } from '@faker-js/faker'
import { Prisma, UserActionPetition } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'

export function mockCreateUserActionPetitionInput() {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    datetimeSigned: faker.date.recent({ days: 30 }),
  } satisfies Omit<Prisma.UserActionPetitionCreateInput, 'userAction' | 'address'>
}

export function mockUserActionPetition(): UserActionPetition {
  return {
    ...mockCreateUserActionPetitionInput(),
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    addressId: fakerFields.id(),
  }
}
