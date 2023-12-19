import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { Address } from '@prisma/client'

export function mockAddress(): Address {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    googlePlacesId: faker.string.uuid(),
    streetAddress1: faker.location.streetAddress(),
    streetAddress2: faker.helpers.maybe(() => faker.location.secondaryAddress()) || '',
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    countryCode: faker.location.countryCode(),
  }
}
