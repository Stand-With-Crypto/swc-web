import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { normalizePhoneNumber } from '@/utils/shared/normalizePhoneNumber'
import { faker } from '@faker-js/faker'
import { User } from '@prisma/client'

export function mockUser(): User {
  const withData = faker.helpers.maybe(() => true, { probability: 0.7 })
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    primaryUserEmailAddressId: fakerFields.id(),
    sampleDatabaseIncrement: 0,
    name: withData ? faker.person.fullName() : '',
    isPubliclyVisible: faker.helpers.maybe(() => true, { probability: 0.9 }) || false,
    phoneNumber: withData ? normalizePhoneNumber(faker.phone.number()) : '',
    addressId: withData ? fakerFields.id() : null,
  }
}
