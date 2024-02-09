import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'
import { Prisma, UserActionEmail } from '@prisma/client'

export function mockCreateUserActionEmailInput() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    senderEmail: faker.internet.email(),
  } satisfies Omit<Prisma.UserActionEmailCreateInput, 'address' | 'addressId'>
}

export function mockUserActionEmail(): UserActionEmail {
  return {
    ...mockCreateUserActionEmailInput(),
    addressId: fakerFields.id(),
    id: fakerFields.id(),
  }
}
