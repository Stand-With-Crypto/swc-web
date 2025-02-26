import { faker } from '@faker-js/faker'
import { Prisma, UserActionEmail } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'

export function mockCreateUserActionEmailInput() {
  return {
    senderEmail: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  } satisfies Omit<Prisma.UserActionEmailCreateInput, 'address' | 'addressId'>
}

export function mockUserActionEmail(): UserActionEmail {
  return {
    ...mockCreateUserActionEmailInput(),
    id: fakerFields.id(),
    addressId: fakerFields.id(),
  }
}
