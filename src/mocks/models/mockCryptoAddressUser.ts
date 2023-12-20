import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { CryptoAddressUser } from '@prisma/client'

export function mockCryptoAddressUser(): CryptoAddressUser {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    address: faker.finance.ethereumAddress(),
    inferredUserId: fakerFields.id(),
    sampleDatabaseIncrement: 0,
  }
}
