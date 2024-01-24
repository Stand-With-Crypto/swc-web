import { fakerFields } from '@/mocks/fakerUtils'
import { faker } from '@faker-js/faker'
import { UserActionEmail } from '@prisma/client'

export function mockUserActionEmail(): UserActionEmail {
  return {
    id: fakerFields.id(),
    senderEmail: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    addressId: fakerFields.id(),
  }
}
