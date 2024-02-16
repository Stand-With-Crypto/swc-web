import { faker } from '@faker-js/faker'
import {
  DataCreationMethod,
  Prisma,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'

import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'

export function mockCreateUserEmailAddressInput() {
  const source = faker.helpers.arrayElement(Object.values(UserEmailAddressSource))
  return {
    source,
    emailAddress: faker.internet.email(),
    isVerified: source === UserEmailAddressSource.VERIFIED_THIRD_PARTY,
  } satisfies Omit<Prisma.UserEmailAddressCreateInput, 'userId' | 'user'>
}

export function mockUserEmailAddress(): UserEmailAddress {
  return {
    ...mockCommonDatetimes(),
    ...mockCreateUserEmailAddressInput(),
    id: fakerFields.id(),
    userId: fakerFields.id(),
    dataCreationMethod: DataCreationMethod.BY_USER,
  }
}
