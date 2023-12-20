import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { normalizePhoneNumber } from '@/utils/shared/normalizePhoneNumber'
import { faker } from '@faker-js/faker'
import { CryptoAddressUser } from '@prisma/client'

export function mockCryptoAddressUser(): CryptoAddressUser {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    cryptoAddress: faker.finance.ethereumAddress(),
    inferredUserId: fakerFields.id(),
    sampleDatabaseIncrement: 0,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    isPubliclyVisible: faker.helpers.maybe(() => true, { probability: 0.8 }) || false,
    phoneNumber: normalizePhoneNumber(faker.phone.number()),
    addressId: fakerFields.id(),
  }
}
