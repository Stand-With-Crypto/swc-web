import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { normalizePhoneNumber } from '@/utils/shared/normalizePhoneNumber'
import { faker } from '@faker-js/faker'
import {
  SupportedUserCryptoNetwork,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'

export function mockUserEmailAddress(): UserEmailAddress {
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    address: faker.internet.email(),
    source: faker.helpers.arrayElement(Object.values(UserEmailAddressSource)),
    userId: fakerFields.id(),
  }
}
