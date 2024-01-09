import { fakerFields } from '@/mocks/fakerUtils'
import { mockCommonDatetimes } from '@/mocks/mockCommonDatetimes'
import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { faker } from '@faker-js/faker'
import { UserActionEmail } from '@prisma/client'

export function mockUserActionEmail(): UserActionEmail {
  return {
    id: fakerFields.id(),
    senderEmail: faker.internet.email(),
    fullName: faker.person.fullName(),
    phoneNumber: fakerFields.phoneNumber(),
    addressId: fakerFields.id(),
  }
}
