import { faker } from '@faker-js/faker'

import { fakerFields } from '@/mocks/fakerUtils'

export const mockWallet = {
  password: faker.internet.password({ length: 6 }),
}

const mockUserFirstName = faker.person.firstName()
const mockUserLastName = faker.person.lastName()

export const mockRandomUser = {
  email: faker.internet.email({
    firstName: mockUserFirstName,
    lastName: mockUserLastName,
  }),
  firstName: mockUserFirstName,
  lastName: mockUserLastName,
  phoneNumber: fakerFields.phoneNumber(),
  // has to be an existing one
  address: '350 Fifth Avenue New York, NY 10118',
}
