import { faker } from '@faker-js/faker'

const mockUserFirstName = faker.person.firstName()
const mockUserLastName = faker.person.lastName()

export const mockRandomUser = {
  email: faker.internet.email({
    firstName: mockUserFirstName,
    lastName: mockUserLastName,
  }),
  firstName: mockUserFirstName,
  lastName: mockUserLastName,
  phoneNumber: faker.helpers.fromRegExp(/([0-9]{3}) [0-9]{3} [0-9]{4}/),
  // has to be an existing one
  address: '350 Fifth Avenue New York, NY 10118',
}
