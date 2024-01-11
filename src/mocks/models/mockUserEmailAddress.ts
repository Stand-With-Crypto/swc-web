import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { faker } from '@faker-js/faker'
import {
  SupportedUserCryptoNetwork,
  UserEmailAddress,
  UserEmailAddressSource,
} from '@prisma/client'

export function mockUserEmailAddress(): UserEmailAddress {
  const source = faker.helpers.arrayElement(Object.values(UserEmailAddressSource))
  return {
    ...mockCommonDatetimes(),
    id: fakerFields.id(),
    address: faker.internet.email(),
    source,
    isVerified: source === UserEmailAddressSource.COINBASE_AUTH,
    userId: fakerFields.id(),
  }
}
