import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { UserEmailAddress, UserEmailAddressSource } from '@prisma/client'

export function mockUserEmailAddress(): UserEmailAddress {
  const source = faker.helpers.arrayElement(Object.values(UserEmailAddressSource))
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    emailAddress: faker.internet.email(),
    source,
    isVerified: source === UserEmailAddressSource.VERIFIED_THIRD_PARTY,
    userId: fakerFields.id(),
  }
}
