import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { normalizePhoneNumber } from '@/utils/shared/normalizePhoneNumber'
import { faker } from '@faker-js/faker'
import { CryptoAddressUser } from '@prisma/client'

export function mockCryptoAddressUser(): CryptoAddressUser {
  const withData = faker.helpers.maybe(() => true, { probability: 0.7 })
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    cryptoAddress: faker.finance.ethereumAddress(),
    inferredUserId: fakerFields.id(),
    sampleDatabaseIncrement: 0,
    name: withData ? faker.person.fullName() : '',
    email: withData ? faker.internet.email() : '',
    isPubliclyVisible: faker.helpers.maybe(() => true, { probability: 0.9 }) || false,
    phoneNumber: withData ? normalizePhoneNumber(faker.phone.number()) : '',
    addressId: withData ? fakerFields.id() : null,
  }
}
