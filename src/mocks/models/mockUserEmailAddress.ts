import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { faker } from '@faker-js/faker'
import { Prisma, UserEmailAddress, UserEmailAddressSource } from '@prisma/client'

export function mockCreateUserEmailAddressInput() {
  const source = faker.helpers.arrayElement(Object.values(UserEmailAddressSource))
  return {
    emailAddress: faker.internet.email(),
    isVerified: source === UserEmailAddressSource.VERIFIED_THIRD_PARTY,
    source,
  } satisfies Omit<Prisma.UserEmailAddressCreateInput, 'userId' | 'user'>
}

export function mockUserEmailAddress(): UserEmailAddress {
  return {
    ...mockCommonDatetimes(),
    ...mockCreateUserEmailAddressInput(),
    id: fakerFields.id(),
    userId: fakerFields.id(),
  }
}
