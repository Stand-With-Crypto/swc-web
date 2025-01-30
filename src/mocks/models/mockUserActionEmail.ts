import { faker } from '@faker-js/faker'
import { Prisma, UserActionEmail } from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { ORDERED_SUPPORTED_COUNTRIES } from '@/utils/shared/supportedCountries'

export function mockCreateUserActionEmailInput() {
  return {
    senderEmail: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    tenantId: faker.helpers.arrayElement(Object.values(ORDERED_SUPPORTED_COUNTRIES)),
  } satisfies Omit<Prisma.UserActionEmailCreateInput, 'address' | 'addressId'>
}

export function mockUserActionEmail(): UserActionEmail {
  return {
    ...mockCreateUserActionEmailInput(),
    id: fakerFields.id(),
    addressId: fakerFields.id(),
  }
}
